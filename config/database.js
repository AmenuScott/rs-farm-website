const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'data', 'farm.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create farms table
  db.run(`CREATE TABLE IF NOT EXISTS farms (
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

  // Attempt to add missing columns for backward compatibility (SQLite ignores duplicate column add)
  db.run(`ALTER TABLE farms ADD COLUMN website TEXT`, (err) => { if (err && !/duplicate column name/i.test(err.message)) console.warn('ALTER TABLE farms add website:', err.message); });
  db.run(`ALTER TABLE farms ADD COLUMN image_url TEXT`, (err) => { if (err && !/duplicate column name/i.test(err.message)) console.warn('ALTER TABLE farms add image_url:', err.message); });

  // Create crops table
  db.run(`CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    season TEXT NOT NULL,
    origin TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '🥕',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create farm_crops junction table
  db.run(`CREATE TABLE IF NOT EXISTS farm_crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER NOT NULL,
    crop_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    available BOOLEAN DEFAULT 1,
    FOREIGN KEY (farm_id) REFERENCES farms (id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops (id) ON DELETE CASCADE
  )`);

  // Create users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample data if tables are empty
  insertSampleData();
}

// Insert sample data
function insertSampleData() {
  // Check if farms table is empty
  db.get("SELECT COUNT(*) as count FROM farms", (err, row) => {
    if (err) {
      console.error('Error checking farms table:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('🌱 Inserting sample farm data...');
      
      const sampleFarms = [
        ['Maple Valley Farm', 'canada', 'Ontario, Canada', 'Family-owned farm specializing in apples and root vegetables', 4.8, '🌾'],
        ['Sunny Coast Orchard', 'australia', 'Queensland, Australia', 'Tropical fruit orchard with year-round production', 4.9, '🍊'],
        ['Alpine Meadows Farm', 'switzerland', 'Bern, Switzerland', 'Mountain farm producing high-quality grapes and vegetables', 4.7, '🏔️'],
        ['Tropical Paradise Farm', 'west-africa', 'Ghana, West Africa', 'Traditional African farm with diverse tropical fruits', 4.6, '🌴'],
        ['Prairie Harvest Farm', 'canada', 'Manitoba, Canada', 'Large-scale vegetable farm serving the prairies', 4.5, '🌾'],
        ['Outback Fresh Farm', 'australia', 'New South Wales, Australia', 'Sustainable farming in the Australian outback', 4.4, '🦘'],
        ['Swiss Valley Farm', 'switzerland', 'Zurich, Switzerland', 'Organic farming in the Swiss valleys', 4.8, '🏔️'],
        ['West African Heritage Farm', 'west-africa', 'Nigeria, West Africa', 'Heritage crops and traditional farming methods', 4.3, '🌍']
      ];

      const insertFarm = db.prepare("INSERT INTO farms (name, country, location, description, rating, icon) VALUES (?, ?, ?, ?, ?, ?)");
      sampleFarms.forEach(farm => insertFarm.run(farm));
      insertFarm.finalize();
    }
  });

  // Check if crops table is empty
  db.get("SELECT COUNT(*) as count FROM crops", (err, row) => {
    if (err) {
      console.error('Error checking crops table:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('🥕 Inserting sample crop data...');
      
      const sampleCrops = [
        ['Apples', 'fruits', 'Fall', 'Canada, Switzerland', 'Fresh, crisp apples available year-round', '🍎'],
        ['Oranges', 'fruits', 'Winter', 'Australia, West Africa', 'Sweet and juicy citrus fruits', '🍊'],
        ['Grapes', 'fruits', 'Summer', 'Switzerland, Australia', 'Perfect for wine and fresh eating', '🍇'],
        ['Mangoes', 'fruits', 'Summer', 'West Africa, Australia', 'Tropical sweetness from West Africa', '🥭'],
        ['Strawberries', 'fruits', 'Spring', 'Canada, Australia', 'Sweet berries perfect for desserts', '🍓'],
        ['Peaches', 'fruits', 'Summer', 'Canada, Switzerland', 'Soft, fuzzy stone fruits', '🍑'],
        ['Carrots', 'vegetables', 'Year-round', 'Canada, Australia', 'Nutritious root vegetables', '🥕'],
        ['Tomatoes', 'vegetables', 'Summer', 'All Regions', 'Versatile and flavorful', '🍅'],
        ['Lettuce', 'vegetables', 'Spring/Fall', 'Switzerland, Canada', 'Fresh leafy greens', '🥬'],
        ['Broccoli', 'vegetables', 'Fall/Spring', 'Canada, Australia', 'Nutritious green vegetable', '🥦'],
        ['Corn', 'vegetables', 'Summer', 'Canada, West Africa', 'Sweet summer corn', '🌽'],
        ['Potatoes', 'vegetables', 'Fall', 'All Regions', 'Staple root vegetable', '🥔']
      ];

      const insertCrop = db.prepare("INSERT INTO crops (name, category, season, origin, description, emoji) VALUES (?, ?, ?, ?, ?, ?)");
      sampleCrops.forEach(crop => insertCrop.run(crop));
      insertCrop.finalize();
    }
  });

  // Check if farm_crops table is empty
  db.get("SELECT COUNT(*) as count FROM farm_crops", (err, row) => {
    if (err) {
      console.error('Error checking farm_crops table:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('🔗 Linking farms and crops...');
      
      // Link farms with crops (simplified relationships)
      const farmCropLinks = [
        [1, 1, 100, 2.50], // Maple Valley Farm - Apples
        [1, 7, 200, 1.50], // Maple Valley Farm - Carrots
        [1, 12, 150, 0.75], // Maple Valley Farm - Potatoes
        [2, 2, 80, 3.00],   // Sunny Coast Orchard - Oranges
        [2, 4, 60, 4.50],   // Sunny Coast Orchard - Mangoes
        [2, 5, 40, 5.00],   // Sunny Coast Orchard - Strawberries
        [3, 3, 120, 4.00],  // Alpine Meadows Farm - Grapes
        [3, 9, 100, 2.00],  // Alpine Meadows Farm - Lettuce
        [3, 1, 90, 2.75],   // Alpine Meadows Farm - Apples
        [4, 4, 70, 4.00],   // Tropical Paradise Farm - Mangoes
        [4, 2, 50, 2.50],   // Tropical Paradise Farm - Oranges
        [5, 7, 300, 1.25],  // Prairie Harvest Farm - Carrots
        [5, 10, 150, 2.00], // Prairie Harvest Farm - Broccoli
        [5, 12, 400, 0.50], // Prairie Harvest Farm - Potatoes
        [6, 8, 200, 2.25],  // Outback Fresh Farm - Tomatoes
        [6, 10, 120, 2.50], // Outback Fresh Farm - Broccoli
        [6, 7, 250, 1.75],  // Outback Fresh Farm - Carrots
        [7, 9, 180, 2.00],  // Swiss Valley Farm - Lettuce
        [7, 10, 100, 2.75], // Swiss Valley Farm - Broccoli
        [7, 7, 200, 2.00],  // Swiss Valley Farm - Carrots
        [8, 8, 150, 1.50],  // West African Heritage Farm - Tomatoes
        [8, 11, 300, 1.00], // West African Heritage Farm - Corn
        [8, 9, 120, 1.75]   // West African Heritage Farm - Lettuce
      ];

      const insertFarmCrop = db.prepare("INSERT INTO farm_crops (farm_id, crop_id, quantity, price) VALUES (?, ?, ?, ?)");
      farmCropLinks.forEach(link => insertFarmCrop.run(link));
      insertFarmCrop.finalize();
    }
  });
}

module.exports = db;
