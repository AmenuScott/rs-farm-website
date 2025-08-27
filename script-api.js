// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper Functions
class FarmAPI {
  static async getFarms(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.crop_type) queryParams.append('crop_type', filters.crop_type);
      if (filters.season) queryParams.append('season', filters.season);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/farms?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch farms');
      
      const data = await response.json();
      return data.farms || [];
    } catch (error) {
      console.error('Error fetching farms:', error);
      return [];
    }
  }

  static async getFarmById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/farms/${id}`);
      if (!response.ok) throw new Error('Failed to fetch farm');
      
      const data = await response.json();
      return data.farm;
    } catch (error) {
      console.error('Error fetching farm:', error);
      return null;
    }
  }

  static async getCrops(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.season) queryParams.append('season', filters.season);
      if (filters.origin) queryParams.append('origin', filters.origin);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/crops?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch crops');
      
      const data = await response.json();
      return data.crops || [];
    } catch (error) {
      console.error('Error fetching crops:', error);
      return [];
    }
  }

  static async getCropsByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/crops/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch crops by category');
      
      const data = await response.json();
      return data.crops || [];
    } catch (error) {
      console.error('Error fetching crops by category:', error);
      return [];
    }
  }

  static async getStats() {
    try {
      const [farmsResponse, cropsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/farms/stats/overview`),
        fetch(`${API_BASE_URL}/crops/stats/overview`)
      ]);

      if (!farmsResponse.ok || !cropsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const farmsData = await farmsResponse.json();
      const cropsData = await cropsResponse.json();

      return {
        farms: farmsData.stats,
        crops: cropsData.stats
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }
}

// Authentication Helper Functions
class AuthAPI {
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  static isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static getAuthToken() {
    return localStorage.getItem('authToken');
  }
}

// UI State Management
class UIState {
  constructor() {
    this.currentUser = AuthAPI.getCurrentUser();
    this.isLoading = false;
    this.currentFilters = {
      country: '',
      crop_type: '',
      season: ''
    };
  }

  updateUser(user) {
    this.currentUser = user;
    this.updateUIForUser();
  }

  updateUIForUser() {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    
    if (this.currentUser) {
      if (authSection) authSection.style.display = 'none';
      if (userSection) {
        userSection.style.display = 'block';
        const usernameSpan = userSection.querySelector('.username');
        if (usernameSpan) usernameSpan.textContent = this.currentUser.username;
      }
    } else {
      if (authSection) authSection.style.display = 'block';
      if (userSection) userSection.style.display = 'none';
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = loading ? 'block' : 'none';
    }
  }
}

// Initialize UI State
const uiState = new UIState();

// DOM Elements
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const countrySelect = document.getElementById('country');
const cropTypeSelect = document.getElementById('crop-type');
const seasonSelect = document.getElementById('season');

// Event Listeners
if (searchBtn) {
  searchBtn.addEventListener('click', searchFarms);
}

if (countrySelect) {
  countrySelect.addEventListener('change', searchFarms);
}

if (cropTypeSelect) {
  cropTypeSelect.addEventListener('change', searchFarms);
}

if (seasonSelect) {
  seasonSelect.addEventListener('change', searchFarms);
}

// Search Farms Function
async function searchFarms() {
  try {
    uiState.setLoading(true);
    
    const filters = {
      country: countrySelect?.value || '',
      crop_type: cropTypeSelect?.value || '',
      season: seasonSelect?.value || ''
    };

    const farms = await FarmAPI.getFarms(filters);
    displaySearchResults(farms);
  } catch (error) {
    console.error('Search error:', error);
    displayErrorMessage('Failed to search farms. Please try again.');
  } finally {
    uiState.setLoading(false);
  }
}

// Display Search Results
function displaySearchResults(farms) {
  if (!searchResults) return;

  if (farms.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No farms found matching your criteria.</p>
        <p>Try adjusting your search filters.</p>
      </div>
    `;
    return;
  }

  const resultsHTML = farms.map(farm => `
    <div class="farm-card" data-farm-id="${farm.id}">
      <div class="farm-header">
        <div class="farm-icon">${farm.icon}</div>
        <div class="farm-info">
          <h3>${farm.name}</h3>
          <p>${farm.location}</p>
        </div>
      </div>
      <div class="farm-details">
        <div class="farm-detail">
          <strong>Rating:</strong> ${farm.rating}/5 ⭐
        </div>
        <div class="farm-detail">
          <strong>Crops:</strong> ${farm.crops.join(', ') || 'No crops listed'}
        </div>
        <div class="farm-detail">
          <strong>Categories:</strong> ${farm.crop_categories.join(', ') || 'No categories'}
        </div>
      </div>
      <button class="view-farm-btn" onclick="viewFarmDetails(${farm.id})">
        View Details
      </button>
    </div>
  `).join('');

  searchResults.innerHTML = resultsHTML;
}

// View Farm Details
async function viewFarmDetails(farmId) {
  try {
    const farm = await FarmAPI.getFarmById(farmId);
    if (farm) {
      displayFarmModal(farm);
    }
  } catch (error) {
    console.error('Error fetching farm details:', error);
    displayErrorMessage('Failed to load farm details.');
  }
}

// Display Farm Modal
function displayFarmModal(farm) {
  const modalHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${farm.name}</h2>
          <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="farm-info-detail">
            <p><strong>Location:</strong> ${farm.location}</p>
            <p><strong>Country:</strong> ${farm.country}</p>
            <p><strong>Rating:</strong> ${farm.rating}/5 ⭐</p>
            <p><strong>Description:</strong> ${farm.description || 'No description available'}</p>
          </div>
          <div class="farm-crops">
            <h3>Available Crops</h3>
            ${farm.crops && farm.crops.length > 0 ? 
              farm.crops.map(crop => `
                <div class="crop-item">
                  <span class="crop-emoji">${crop.emoji}</span>
                  <div class="crop-info">
                    <strong>${crop.name}</strong>
                    <p>${crop.description}</p>
                    <small>Season: ${crop.season} | Price: $${crop.price}/unit | Quantity: ${crop.quantity}</small>
                  </div>
                </div>
              `).join('') : 
              '<p>No crops available</p>'
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close Modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
  }
}

// Display Error Message
function displayErrorMessage(message) {
  if (searchResults) {
    searchResults.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }
}

// Load Crops Data
async function loadCropsData() {
  try {
    const crops = await FarmAPI.getCrops();
    updateCropsDisplay(crops);
  } catch (error) {
    console.error('Error loading crops:', error);
  }
}

// Update Crops Display
function updateCropsDisplay(crops) {
  const cropsGrid = document.querySelector('.crops-grid');
  if (!cropsGrid) return;

  const cropsHTML = crops.map(crop => `
    <div class="crop-card" data-category="${crop.category}">
      <div class="crop-image">${crop.emoji}</div>
      <h3>${crop.name}</h3>
      <p>${crop.description}</p>
      <div class="crop-details">
        <span class="season">${crop.season}</span>
        <span class="origin">${crop.origin}</span>
      </div>
    </div>
  `).join('');

  cropsGrid.innerHTML = cropsHTML;
}

// Load Statistics
async function loadStats() {
  try {
    const stats = await FarmAPI.getStats();
    if (stats) {
      updateStatsDisplay(stats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Update Stats Display
function updateStatsDisplay(stats) {
  const statsElements = document.querySelectorAll('.stat-item h3');
  if (statsElements.length >= 3) {
    statsElements[0].textContent = `${stats.farms.total_farms}+`;
    statsElements[1].textContent = `${stats.crops.total_crops}+`;
    statsElements[2].textContent = stats.farms.countries_covered;
  }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
  // Update UI for current user
  uiState.updateUIForUser();
  
  // Load initial data
  await Promise.all([
    loadCropsData(),
    loadStats(),
    searchFarms() // Load initial farm results
  ]);
});

// Export functions for global access
window.viewFarmDetails = viewFarmDetails;
window.closeModal = closeModal;
window.searchFarms = searchFarms;
