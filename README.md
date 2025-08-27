# R S Farm Ltd. - Farm Management System

A comprehensive farm management platform connecting consumers with local farms worldwide. Features a modern frontend with a robust Node.js/Express backend API.

## 🌟 Features

### Frontend
- **Responsive Design**: Modern, mobile-friendly interface
- **Crop Showcase**: Browse fruits and vegetables by category and season
- **Farm Search**: Find farms by country, crop type, and season
- **Interactive UI**: Smooth animations and user experience
- **Real-time Search**: Dynamic filtering and search results

### Backend API
- **RESTful API**: Complete CRUD operations for farms and crops
- **Authentication**: JWT-based user authentication system
- **Database**: SQLite database with automatic initialization
- **Validation**: Input validation and error handling
- **Security**: Helmet.js security headers and CORS protection

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Farm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the backend server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/health

6. **Bulk import real farms (optional)**
   ```bash
   # Prepare your data file at data/real_farms.json (see data/real_farms.sample.json for format)
   # Run the importer (add --reset to clear existing farms/crops first)
   npm run import:farms
   # or
   node scripts/import-farms.js --file data/real_farms.json --reset
   ```

## 🏗️ Project Structure

```
Farm/
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── script.js               # Original frontend JavaScript
├── script-api.js           # API-integrated frontend JavaScript
├── server.js               # Express server entry point
├── package.json            # Node.js dependencies
├── env.example             # Environment configuration template
├── config/
│   └── database.js         # Database configuration and initialization
├── routes/
│   ├── farms.js            # Farm management API routes
│   ├── crops.js            # Crop management API routes
│   └── auth.js             # Authentication API routes
├── data/                   # Database files (auto-created)
│   └── .gitkeep
└── README.md               # This file
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "farmer123",
  "email": "farmer@example.com",
  "password": "securepassword"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "farmer123",
  "password": "securepassword"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Farm Endpoints

#### Get All Farms
```http
GET /api/farms?country=canada&crop_type=fruits&season=summer
```

#### Get Farm by ID
```http
GET /api/farms/1
```

#### Create Farm
```http
POST /api/farms
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "name": "New Farm",
  "country": "canada",
  "location": "Ontario, Canada",
  "description": "Organic farm",
  "rating": 4.5,
  "icon": "🌾"
}
```

#### Update Farm
```http
PUT /api/farms/1
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "rating": 4.8,
  "description": "Updated description"
}
```

#### Delete Farm
```http
DELETE /api/farms/1
Authorization: Bearer <jwt-token>
```

#### Get Farm Statistics
```http
GET /api/farms/stats/overview
```

### Crop Endpoints

#### Get All Crops
```http
GET /api/crops?category=fruits&season=summer
```

#### Get Crop by ID
```http
GET /api/crops/1
```

#### Create Crop
```http
POST /api/crops
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "name": "Blueberries",
  "category": "fruits",
  "season": "summer",
  "origin": "Canada, USA",
  "description": "Sweet summer berries",
  "emoji": "🫐"
}
```

#### Get Crops by Category
```http
GET /api/crops/category/fruits
```

#### Get Crops by Season
```http
GET /api/crops/season/summer
```

#### Get Crop Statistics
```http
GET /api/crops/stats/overview
```

## 🗄️ Database Schema

### Farms Table
- `id` - Primary key
- `name` - Farm name
- `country` - Country location
- `location` - Specific location
- `description` - Farm description
- `rating` - Farm rating (0-5)
- `icon` - Display icon
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Crops Table
- `id` - Primary key
- `name` - Crop name
- `category` - fruits or vegetables
- `season` - Growing season
- `origin` - Geographic origin
- `description` - Crop description
- `emoji` - Display emoji
- `created_at` - Creation timestamp

### Farm_Crops Table (Junction)
- `id` - Primary key
- `farm_id` - Foreign key to farms
- `crop_id` - Foreign key to crops
- `quantity` - Available quantity
- `price` - Price per unit
- `available` - Availability status

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Hashed password
- `role` - User role
- `created_at` - Creation timestamp

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Database connection string
- `CORS_ORIGIN` - CORS allowed origin
- `LOG_LEVEL` - Logging level

### Database
The system uses SQLite by default, which is perfect for development and small to medium deployments. For production, you can easily switch to PostgreSQL, MySQL, or MongoDB by updating the database configuration.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
# Build image
docker build -t rs-farm-backend .

# Run container
docker run -p 3000:3000 rs-farm-backend
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt.js for password security
- **Input Validation**: Express-validator for request validation
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: Parameterized queries

## 📱 Frontend Integration

The frontend automatically integrates with the backend API. To use the API-integrated version:

1. Include `script-api.js` instead of `script.js` in your HTML
2. Ensure the backend server is running
3. The frontend will automatically fetch data from the API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: info@rsfarmltd.com
- Phone: +1 (555) 123-4567

## 🔄 Changelog

### v1.0.0
- Initial release with full-stack implementation
- Complete farm and crop management system
- JWT authentication
- SQLite database with sample data
- RESTful API endpoints
- Modern responsive frontend

---

**Built with ❤️ for sustainable agriculture and local farming communities** 
