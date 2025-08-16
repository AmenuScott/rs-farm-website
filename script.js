// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Crop Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const cropCards = document.querySelectorAll('.crop-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        cropCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Farm Search Functionality
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

// Sample farm data
const farmsData = [
    {
        name: "Maple Valley Farm",
        country: "canada",
        crops: ["fruits", "vegetables"],
        season: "summer",
        location: "Ontario, Canada",
        specialties: ["Apples", "Corn", "Potatoes"],
        rating: 4.8,
        icon: "🌾"
    },
    {
        name: "Sunny Coast Orchard",
        country: "australia",
        crops: ["fruits"],
        season: "winter",
        location: "Queensland, Australia",
        specialties: ["Oranges", "Mangoes", "Strawberries"],
        rating: 4.9,
        icon: "🍊"
    },
    {
        name: "Alpine Meadows Farm",
        country: "switzerland",
        crops: ["fruits", "vegetables"],
        season: "summer",
        location: "Bern, Switzerland",
        specialties: ["Grapes", "Lettuce", "Apples"],
        rating: 4.7,
        icon: "🏔️"
    },
    {
        name: "Tropical Paradise Farm",
        country: "west-africa",
        crops: ["fruits"],
        season: "summer",
        location: "Ghana, West Africa",
        specialties: ["Mangoes", "Oranges", "Bananas"],
        rating: 4.6,
        icon: "🌴"
    },
    {
        name: "Prairie Harvest Farm",
        country: "canada",
        crops: ["vegetables"],
        season: "fall",
        location: "Manitoba, Canada",
        specialties: ["Carrots", "Broccoli", "Potatoes"],
        rating: 4.5,
        icon: "🌾"
    },
    {
        name: "Outback Fresh Farm",
        country: "australia",
        crops: ["vegetables"],
        season: "spring",
        location: "New South Wales, Australia",
        specialties: ["Tomatoes", "Broccoli", "Carrots"],
        rating: 4.4,
        icon: "🦘"
    },
    {
        name: "Swiss Valley Farm",
        country: "switzerland",
        crops: ["vegetables"],
        season: "spring",
        location: "Zurich, Switzerland",
        specialties: ["Lettuce", "Broccoli", "Carrots"],
        rating: 4.8,
        icon: "🏔️"
    },
    {
        name: "West African Heritage Farm",
        country: "west-africa",
        crops: ["vegetables"],
        season: "year-round",
        location: "Nigeria, West Africa",
        specialties: ["Tomatoes", "Corn", "Lettuce"],
        rating: 4.3,
        icon: "🌍"
    }
];

// Search farms based on filters
function searchFarms() {
    const country = document.getElementById('country').value;
    const cropType = document.getElementById('crop-type').value;
    const season = document.getElementById('season').value;
    
    // Show loading state
    searchResults.innerHTML = '<div class="loading"></div>';
    
    // Simulate search delay
    setTimeout(() => {
        let filteredFarms = farmsData;
        
        // Filter by country
        if (country) {
            filteredFarms = filteredFarms.filter(farm => farm.country === country);
        }
        
        // Filter by crop type
        if (cropType) {
            filteredFarms = filteredFarms.filter(farm => farm.crops.includes(cropType));
        }
        
        // Filter by season
        if (season) {
            filteredFarms = filteredFarms.filter(farm => farm.season === season || farm.season === 'year-round');
        }
        
        displaySearchResults(filteredFarms);
    }, 1000);
}

// Display search results
function displaySearchResults(farms) {
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
        <div class="farm-card">
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
                    <strong>Season:</strong> ${farm.season.charAt(0).toUpperCase() + farm.season.slice(1)}
                </div>
                <div class="farm-detail">
                    <strong>Specialties:</strong> ${farm.specialties.join(', ')}
                </div>
                <div class="farm-detail">
                    <strong>Crops:</strong> ${farm.crops.map(crop => crop.charAt(0).toUpperCase() + crop.slice(1)).join(', ')}
                </div>
            </div>
        </div>
    `).join('');
    
    searchResults.innerHTML = resultsHTML;
}

// Add event listener to search button
searchBtn.addEventListener('click', searchFarms);

// Add event listeners to filter dropdowns for real-time search
document.getElementById('country').addEventListener('change', searchFarms);
document.getElementById('crop-type').addEventListener('change', searchFarms);
document.getElementById('season').addEventListener('change', searchFarms);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Add fade-in animation for crop cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all crop cards
cropCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Add CSS animation for fade-in
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize the page with some default content
document.addEventListener('DOMContentLoaded', () => {
    // Show some sample farms on page load
    searchResults.innerHTML = `
        <div class="farm-card">
            <div class="farm-header">
                <div class="farm-icon">🌾</div>
                <div class="farm-info">
                    <h3>Maple Valley Farm</h3>
                    <p>Ontario, Canada</p>
                </div>
            </div>
            <div class="farm-details">
                <div class="farm-detail">
                    <strong>Rating:</strong> 4.8/5 ⭐
                </div>
                <div class="farm-detail">
                    <strong>Season:</strong> Summer
                </div>
                <div class="farm-detail">
                    <strong>Specialties:</strong> Apples, Corn, Potatoes
                </div>
                <div class="farm-detail">
                    <strong>Crops:</strong> Fruits, Vegetables
                </div>
            </div>
        </div>
        <div class="farm-card">
            <div class="farm-header">
                <div class="farm-icon">🍊</div>
                <div class="farm-info">
                    <h3>Sunny Coast Orchard</h3>
                    <p>Queensland, Australia</p>
                </div>
            </div>
            <div class="farm-details">
                <div class="farm-detail">
                    <strong>Rating:</strong> 4.9/5 ⭐
                </div>
                <div class="farm-detail">
                    <strong>Season:</strong> Winter
                </div>
                <div class="farm-detail">
                    <strong>Specialties:</strong> Oranges, Mangoes, Strawberries
                </div>
                <div class="farm-detail">
                    <strong>Crops:</strong> Fruits
                </div>
            </div>
        </div>
    `;
});

// Add hover effects for interactive elements
document.querySelectorAll('.crop-card, .farm-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click effect for buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});
