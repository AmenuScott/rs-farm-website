const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST register new user
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email already exists
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingEmail) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error occurred' });
        }

        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        db.run(`
          INSERT INTO users (username, email, password_hash)
          VALUES (?, ?, ?)
        `, [username, email, hashedPassword], function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { user_id: this.lastID, username, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
              id: this.lastID,
              username,
              email,
              role: 'user'
            },
            token
          });
        });
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST login user
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Find user by username
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET current user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user
      });
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email address'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user.user_id;
    const updates = req.body;

    // Check if user exists
    db.get('SELECT id FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      for (const key of Object.keys(updates)) {
        if (updates[key] !== undefined && key !== 'id' && key !== 'username' && key !== 'role') {
          if (key === 'password') {
            // Hash new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(updates[key], saltRounds);
            updateFields.push('password_hash = ?');
            updateValues.push(hashedPassword);
          } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(updates[key]);
          }
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateValues.push(userId);

      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

      db.run(query, updateValues, function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({
          success: true,
          message: 'Profile updated successfully',
          rows_affected: this.changes
        });
      });
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get user info
    db.get('SELECT username, role FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate new token
      const newToken = jwt.sign(
        { user_id: userId, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      });
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

// GET verify token validity
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      user_id: req.user.user_id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = router;
