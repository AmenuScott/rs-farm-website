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

// Fetch farms from API
async function fetchFarms() {
    try {
        const response = await fetch('/api/farms');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching farms:', error);
        return [];
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const countryFilter = document.getElementById('country-filter');
    const searchButton = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');

    // Store farms data globally for filtering
    let allFarms = await fetchFarms();

    // Function to filter farms
    function filterFarms() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCountry = countryFilter.value;

        const filteredFarms = allFarms.filter(farm => {
            const matchesSearch = 
                farm.name.toLowerCase().includes(searchTerm) ||
                (farm.products && farm.products.some(product => 
                    product.toLowerCase().includes(searchTerm)));

            const matchesCountry = 
                !selectedCountry || 
                (farm.address && farm.address.includes(selectedCountry));

            return matchesSearch && matchesCountry;
        });

        displayFarms(filteredFarms);
    }

    // Function to display farms
    function displayFarms(farmsToDisplay) {
        searchResults.innerHTML = farmsToDisplay.length ? 
            farmsToDisplay.map(farm => createFarmCard(farm)).join('') :
            '<div class="no-results">No farms found matching your criteria</div>';
    }

    // Function to create farm card
    function createFarmCard(farm) {
        return `
            <div class="card">
                <div class="card-content">
                    <div class="card-header">
                        <h3>${farm.name}</h3>
                        <div class="card-info">
                            <p>${farm.address}</p>
                            <p>${farm.contact}</p>
                        </div>
                    </div>
                    <div class="products">
                        ${farm.products.map(product => 
                            `<span class="product-tag">${product}</span>`
                        ).join('')}
                    </div>
                    <button class="view-details-btn">View Details</button>
                </div>
            </div>
        `;
    }

    // Event listeners
    searchButton.addEventListener('click', filterFarms);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterFarms();
    });
    countryFilter.addEventListener('change', filterFarms);

    // Initial display
    displayFarms(allFarms);
});

function displayError(message) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = `
        <div class="error-message">
            <p>😕 ${message}</p>
            <p>Please try again later or contact support if the problem persists.</p>
        </div>
    `;
}



