const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET all crops with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, season, origin, search } = req.query;
    
    let query = 'SELECT * FROM crops WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (season) {
      query += ' AND (season = ? OR season = "Year-round")';
      params.push(season);
    }
    
    if (origin) {
      query += ' AND origin LIKE ?';
      params.push(`%${origin}%`);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY name ASC';
    
    db.all(query, params, (err, crops) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      res.json({
        success: true,
        count: crops.length,
        crops: crops
      });
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET crop by ID
router.get('/:id', async (req, res) => {
  try {
    const cropId = req.params.id;
    
    db.get('SELECT * FROM crops WHERE id = ?', [cropId], (err, crop) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      if (!crop) {
        return res.status(404).json({ error: 'Crop not found' });
      }
      
      res.json({
        success: true,
        crop: crop
      });
    });
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new crop
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Crop name must be between 2 and 100 characters'),
  body('category').isIn(['fruits', 'vegetables']).withMessage('Category must be either fruits or vegetables'),
  body('season').trim().isLength({ min: 2, max: 50 }).withMessage('Season must be between 2 and 50 characters'),
  body('origin').trim().isLength({ min: 2, max: 200 }).withMessage('Origin must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('emoji').optional().trim().isLength({ max: 10 }).withMessage('Emoji must be less than 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const { name, category, season, origin, description, emoji } = req.body;
    
    db.run(`
      INSERT INTO crops (name, category, season, origin, description, emoji)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, category, season, origin, description, emoji || '🥕'], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create crop' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Crop created successfully',
        crop_id: this.lastID
      });
    });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update crop
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Crop name must be between 2 and 100 characters'),
  body('category').optional().isIn(['fruits', 'vegetables']).withMessage('Category must be either fruits or vegetables'),
  body('season').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Season must be between 2 and 50 characters'),
  body('origin').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Origin must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('emoji').optional().trim().isLength({ max: 10 }).withMessage('Emoji must be less than 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    const cropId = req.params.id;
    const updates = req.body;
    
    // Check if crop exists
    db.get('SELECT id FROM crops WHERE id = ?', [cropId], (err, crop) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      if (!crop) {
        return res.status(404).json({ error: 'Crop not found' });
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
      
      updateValues.push(cropId);
      
      const query = `UPDATE crops SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(query, updateValues, function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update crop' });
        }
        
        res.json({
          success: true,
          message: 'Crop updated successfully',
          rows_affected: this.changes
        });
      });
    });
  } catch (error) {
    console.error('Error updating crop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE crop
router.delete('/:id', async (req, res) => {
  try {
    const cropId = req.params.id;
    
    // Check if crop exists
    db.get('SELECT id FROM crops WHERE id = ?', [cropId], (err, crop) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      if (!crop) {
        return res.status(404).json({ error: 'Crop not found' });
      }
      
      // Check if crop is linked to any farms
      db.get('SELECT COUNT(*) as count FROM farm_crops WHERE crop_id = ?', [cropId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error occurred' });
        }
        
        if (result.count > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete crop. It is currently linked to farms.',
            linked_farms: result.count
          });
        }
        
        // Delete crop
        db.run('DELETE FROM crops WHERE id = ?', [cropId], function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to delete crop' });
          }
          
          res.json({
            success: true,
            message: 'Crop deleted successfully',
            rows_affected: this.changes
          });
        });
      });
    });
  } catch (error) {
    console.error('Error deleting crop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET crop statistics
router.get('/stats/overview', async (req, res) => {
  try {
    db.get(`
      SELECT 
        COUNT(*) as total_crops,
        COUNT(DISTINCT category) as categories,
        COUNT(DISTINCT season) as seasons,
        COUNT(DISTINCT origin) as origins
      FROM crops
    `, (err, stats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      res.json({
        success: true,
        stats: stats
      });
    });
  } catch (error) {
    console.error('Error fetching crop stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET crops by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    if (!['fruits', 'vegetables'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be fruits or vegetables' });
    }
    
    db.all('SELECT * FROM crops WHERE category = ? ORDER BY name ASC', [category], (err, crops) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      res.json({
        success: true,
        category: category,
        count: crops.length,
        crops: crops
      });
    });
  } catch (error) {
    console.error('Error fetching crops by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET crops by season
router.get('/season/:season', async (req, res) => {
  try {
    const season = req.params.season;
    
    db.all(`
      SELECT * FROM crops 
      WHERE season = ? OR season = 'Year-round' 
      ORDER BY name ASC
    `, [season], (err, crops) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }
      
      res.json({
        success: true,
        season: season,
        count: crops.length,
        crops: crops
      });
    });
  } catch (error) {
    console.error('Error fetching crops by season:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
