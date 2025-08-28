const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const farmsRoutes = require('./routes/farms');
const cropsRoutes = require('./routes/crops');
const authRoutes = require('./routes/auth');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(__dirname));
app.use('/images', express.static('images'));

// API Routes
app.use('/api/farms', farmsRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'R S Farm API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/farms', async (req, res) => {
    try {
        const farms = await Farm.findAll(); // Assuming you're using a database
        res.json(farms);
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({ 
            error: 'Failed to fetch farms',
            message: error.message 
        });
    }
});

// Serve the main HTML file for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚜 R S Farm API server running on port ${PORT}`);
  console.log(`📱 Frontend available at http://localhost:${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});
