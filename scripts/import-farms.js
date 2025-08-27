/*
  Bulk importer for farms and crops.

  Usage:
    node scripts/import-farms.js --file data/real_farms.json [--reset]

  JSON format (array of farms):
    [
      {
        "name": "Maple Valley Farm",
        "country": "canada",
        "location": "Ontario, Canada",
        "description": "Family-owned organic farm",
        "rating": 4.8,
        "icon": "🌾",
        "crops": [
          {
            "name": "Apples",
            "category": "fruits",
            "season": "Fall",
            "origin": "Canada",
            "description": "Crisp apples",
            "emoji": "🍎",
            "quantity": 100,
            "price": 2.5,
            "available": true
          }
        ]
      }
    ]
*/

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: null, reset: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file' || arg === '-f') {
      opts.file = args[++i];
    } else if (arg === '--reset') {
      opts.reset = true;
    }
  }
  return opts;
}

function openDb() {
  const dbPath = path.join(__dirname, '..', 'data', 'farm.db');
  return new sqlite3.Database(dbPath);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function ensureTables(db) {
  // Keep in sync with config/database.js
  await run(db, `CREATE TABLE IF NOT EXISTS farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    website TEXT,
    image_url TEXT,
    rating REAL DEFAULT 0,
    icon TEXT DEFAULT '🌾',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Backfill columns if the table existed without new fields
  await new Promise(resolve => db.run(`ALTER TABLE farms ADD COLUMN website TEXT`, err => resolve()));
  await new Promise(resolve => db.run(`ALTER TABLE farms ADD COLUMN image_url TEXT`, err => resolve()));

  await run(db, `CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    season TEXT NOT NULL,
    origin TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '🥕',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(db, `CREATE TABLE IF NOT EXISTS farm_crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER NOT NULL,
    crop_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    available BOOLEAN DEFAULT 1,
    FOREIGN KEY (farm_id) REFERENCES farms (id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE
  )`);

  await run(db, `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

async function resetData(db) {
  await run(db, 'DELETE FROM farm_crops');
  await run(db, 'DELETE FROM farms');
  // Keep crops optionally; but for full reset remove as well
  await run(db, 'DELETE FROM crops');
}

async function upsertCrop(db, crop) {
  // Try find existing by name + origin (basic uniqueness heuristic)
  const existing = await get(db, 'SELECT id FROM crops WHERE name = ? AND origin = ?', [crop.name, crop.origin]);
  if (existing) {
    return existing.id;
  }
  const res = await run(db, `INSERT INTO crops (name, category, season, origin, description, emoji)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [crop.name, crop.category, crop.season, crop.origin, crop.description || null, crop.emoji || '🥕']
  );
  return res.lastID;
}

async function insertFarm(db, farm) {
  const res = await run(db, `INSERT INTO farms (name, country, location, description, website, image_url, rating, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [farm.name, farm.country, farm.location, farm.description || null, farm.website || null, farm.image_url || null, farm.rating || 0, farm.icon || '🌾']
  );
  return res.lastID;
}

async function linkFarmCrop(db, farmId, cropId, link) {
  await run(db, `INSERT INTO farm_crops (farm_id, crop_id, quantity, price, available)
    VALUES (?, ?, ?, ?, ?)`,
    [farmId, cropId, link.quantity || 0, link.price || 0, link.available === false ? 0 : 1]
  );
}

async function main() {
  const { file, reset } = parseArgs();
  if (!file) {
    console.error('Missing --file path to JSON.');
    process.exit(1);
  }

  const absFile = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(absFile)) {
    console.error(`File not found: ${absFile}`);
    process.exit(1);
  }

  const json = JSON.parse(fs.readFileSync(absFile, 'utf8'));
  if (!Array.isArray(json)) {
    console.error('JSON root must be an array of farms.');
    process.exit(1);
  }

  const db = openDb();
  try {
    await ensureTables(db);
    if (reset) {
      console.log('Resetting farm, crop and farm_crops data...');
      await resetData(db);
    }

    // Wrap inserts in a transaction for speed
    await run(db, 'BEGIN TRANSACTION');
    for (const farm of json) {
      if (!farm || !farm.name || !farm.country || !farm.location) {
        console.warn('Skipping invalid farm record (missing required fields):', farm && farm.name);
        continue;
      }
      const farmId = await insertFarm(db, farm);
      if (Array.isArray(farm.crops)) {
        for (const crop of farm.crops) {
          if (!crop || !crop.name || !crop.category || !crop.season || !crop.origin) {
            console.warn('Skipping invalid crop for farm', farm.name);
            continue;
          }
          const cropId = await upsertCrop(db, crop);
          await linkFarmCrop(db, farmId, cropId, crop);
        }
      }
    }
    await run(db, 'COMMIT');
    console.log(`✅ Imported ${json.length} farms successfully.`);
  } catch (err) {
    try { await run(db, 'ROLLBACK'); } catch (_) {}
    console.error('❌ Import failed:', err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();


