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

// Media Carousel Logic
document.addEventListener('DOMContentLoaded', () => {
    const slides = Array.from(document.querySelectorAll('.media-slide'));
    const prevBtn = document.querySelector('.media-prev');
    const nextBtn = document.querySelector('.media-next');
    const indicatorsContainer = document.querySelector('.media-indicators');
    if (!slides.length || !indicatorsContainer) return;

    // Build indicators
    slides.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (idx === 0 ? ' active' : '');
        dot.dataset.index = String(idx);
        indicatorsContainer.appendChild(dot);
    });

    const dots = Array.from(indicatorsContainer.querySelectorAll('.dot'));
    let current = 0;
    let timer = null;

    function show(index) {
        // Hide all slides
        slides.forEach((slide) => {
            slide.classList.remove('active');
            const v = slide.querySelector('video');
            if (v) v.pause();
        });
        dots.forEach(dot => dot.classList.remove('active'));

        current = (index + slides.length) % slides.length;

        // Show target slide
        const active = slides[current];
        active.classList.add('active');
        dots[current].classList.add('active');

        // Play video if present
        const video = active.querySelector('video');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
        }
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function auto() {
        clearInterval(timer);
        // Longer delay if current is a video; use its duration if available
        const activeVideo = slides[current].querySelector('video');
        const delay = activeVideo && !isNaN(activeVideo.duration) && activeVideo.duration > 0
            ? Math.min(activeVideo.duration * 1000, 12000)
            : 5000;
        timer = setInterval(next, delay);
    }

    // Init first video state
    const firstVideo = slides[0].querySelector('video');
    if (firstVideo) {
        firstVideo.play().catch(() => {});
    }

    // Controls
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); auto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); auto(); });
    dots.forEach(dot => dot.addEventListener('click', (e) => { const idx = parseInt(e.currentTarget.dataset.index); show(idx); auto(); }));

    // Auto-rotate
    show(0);
    auto();

    // Pause on hover
    const carousel = document.querySelector('.media-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => clearInterval(timer));
        carousel.addEventListener('mouseleave', auto);
    }
});

function createFarmCard(farm) {
    return `
        <div class="card">
            <div class="card-content">
                <div class="card-header">
                    <h3>${farm.name}</h3>
                    <div class="card-info">
                        <p>${farm.address}</p>
                        <p>${farm.contact || 'Contact not available'}</p>
                    </div>
                </div>
                <div class="products">
                    ${farm.products.map(product => `
                        <span class="product-tag">${product}</span>
                    `).join('')}
                </div>
                <button class="view-details-btn">View Details</button>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const searchInput = document.getElementById('search-input');
    const countryFilter = document.getElementById('country-filter');
    const searchButton = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');

    // Store all farms for filtering
    let allFarms = [];

    // Fetch farms data
    async function fetchFarms() {
        try {
            const response = await fetch('/api/farms');
            allFarms = await response.json();
            filterAndDisplayFarms();
        } catch (error) {
            console.error('Error fetching farms:', error);
        }
    }

    // Filter farms based on search criteria
    function filterAndDisplayFarms() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCountry = countryFilter.value.trim();

        const filteredFarms = allFarms.filter(farm => {
            // Check if farm has required properties
            if (!farm || !farm.name || !farm.address || !farm.products) {
                return false;
            }

            // Country filter
            if (selectedCountry) {
                const farmCountry = farm.address.split(',').pop().trim();
                if (!farmCountry.toLowerCase().includes(selectedCountry.toLowerCase())) {
                    return false;
                }
            }

            // Search term filter
            if (searchTerm) {
                return farm.name.toLowerCase().includes(searchTerm) ||
                       farm.address.toLowerCase().includes(searchTerm) ||
                       farm.products.some(product => 
                           product.toLowerCase().includes(searchTerm));
            }

            return true;
        });

        // Display filtered farms
        searchResults.innerHTML = filteredFarms.length > 0 
            ? filteredFarms.map(farm => createFarmCard(farm)).join('')
            : '<div class="no-results">No farms found matching your criteria</div>';
    }

    // Event listeners
    searchInput.addEventListener('input', filterAndDisplayFarms);
    countryFilter.addEventListener('change', filterAndDisplayFarms);
    searchButton.addEventListener('click', filterAndDisplayFarms);
    
    // Optional: Add enter key support for search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterAndDisplayFarms();
        }
    });

    // Initial load
    fetchFarms();
});



