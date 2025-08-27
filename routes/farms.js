const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET all farms with optional filtering
router.get('/', async (req, res) => {
  try {
    const { country, crop_type, season, search } = req.query;
    
    let query = `
      SELECT DISTINCT f.*, 
             GROUP_CONCAT(DISTINCT c.name) as crop_names,
             GROUP_CONCAT(DISTINCT c.category) as crop_categories
      FROM farms f
      LEFT JOIN farm_crops fc ON f.id = fc.farm_id
      LEFT JOIN crops c ON fc.crop_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (country) {
      conditions.push('f.country = ?');
      params.push(country);
    }
    
    if (crop_type) {
      conditions.push('c.category = ?');
      params.push(crop_type);
    }
    
    if (season) {
      conditions.push('(c.season = ? OR c.season = "Year-round")');
      params.push(season);
    }
    
    if (search) {
      conditions.push('(f.name LIKE ? OR f.location LIKE ? OR f.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY f.id ORDER BY f.rating DESC';
    
    db.all(query, params, (err, farms) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      // Process the results to format crop information
      const processedFarms = farms.map(farm => ({
        id: farm.id,
        name: farm.name,
        country: farm.country,
        location: farm.location,
        description: farm.description,
        rating: farm.rating,
        icon: farm.icon,
        crops: farm.crop_names ? farm.crop_names.split(',') : [],
        crop_categories: farm.crop_categories ? [...new Set(farm.crop_categories.split(','))] : [],
        created_at: farm.created_at,
        updated_at: farm.updated_at
      }));
      
      res.json({
        success: true,
        count: processedFarms.length,
        farms: processedFarms
      });
    });
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET farm by ID with detailed crop information
router.get('/:id', async (req, res) => {
  try {
    const farmId = req.params.id;
    
    // Get farm details
    db.get('SELECT * FROM farms WHERE id = ?', [farmId], (err, farm) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }
      
      // Get farm's crops with pricing
      db.all(`
        SELECT c.*, fc.quantity, fc.price, fc.available
        FROM crops c
        JOIN farm_crops fc ON c.id = fc.crop_id
        WHERE fc.farm_id = ?
      `, [farmId], (err, crops) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error occurred' });
        }
        
        const farmData = {
          ...farm,
          crops: crops.map(crop => ({
            id: crop.id,
            name: crop.name,
            category: crop.category,
            season: crop.season,
            origin: crop.origin,
            description: crop.description,
            emoji: crop.emoji,
            quantity: crop.quantity,
            price: crop.price,
            available: crop.available
          }))
        };
        
        res.json({
          success: true,
          farm: farmData
        });
      });
    });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new farm
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Farm name must be between 2 and 100 characters'),
  body('country').trim().isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters'),
  body('location').trim().isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon must be less than 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { name, country, location, description, rating, icon } = req.body;
    
    db.run(`
      INSERT INTO farms (name, country, location, description, rating, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, country, location, description, rating || 0, icon || '🌾'], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create farm' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Farm created successfully',
        farm_id: this.lastID
      });
    });
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update farm
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Farm name must be between 2 and 100 characters'),
  body('country').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters'),
  body('location').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon must be less than 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const farmId = req.params.id;
    const updates = req.body;
    
    // Check if farm exists
    db.get('SELECT id FROM farms WHERE id = ?', [farmId], (err, farm) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }
      
      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'id') {
          updateFields.push(`${key} = ?`);
          updateValues.push(updates[key]);
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(farmId);
      
      const query = `UPDATE farms SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(query, updateValues, function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update farm' });
        }
        
        res.json({
          success: true,
          message: 'Farm updated successfully',
          rows_affected: this.changes
        });
      });
    });
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE farm
router.delete('/:id', async (req, res) => {
  try {
    const farmId = req.params.id;
    
    // Check if farm exists
    db.get('SELECT id FROM farms WHERE id = ?', [farmId], (err, farm) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }
      
      // Delete farm (cascade will handle farm_crops)
      db.run('DELETE FROM farms WHERE id = ?', [farmId], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to delete farm' });
        }
        
        res.json({
          success: true,
          message: 'Farm deleted successfully',
          rows_affected: this.changes
        });
      });
    });
  } catch (error) {
    console.error('Error deleting farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET farm statistics
router.get('/stats/overview', async (req, res) => {
  try {
    db.get(`
      SELECT 
        COUNT(*) as total_farms,
        AVG(rating) as average_rating,
        COUNT(DISTINCT country) as countries_covered
      FROM farms
    `, (err, stats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      res.json({
        success: true,
        stats: {
          total_farms: stats.total_farms,
          average_rating: Math.round(stats.average_rating * 10) / 10,
          countries_covered: stats.countries_covered
        }
      });
    });
  } catch (error) {
    console.error('Error fetching farm stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
