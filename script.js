// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

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

// Utility to remove numbers from address
function removeNumbers(str) {
    return str.replace(/[0-9]/g, '').replace(/\s+/g, ' ').trim();
}

// Sample mock farms with unique images
const mockFarms = [
    {
        name: "Maple Valley Organics",
        address: "Fraser Valley Road, Vancouver, Canada",
        products: ["Maple Syrup", "Berries", "Apples", "Honey"],
        image: "images/mapple.jpg"
    },
    {
        name: "Prairie Wheat Fields",
        address: "Saskatchewan Drive, Regina, Canada",
        products: ["Wheat", "Canola", "Barley", "Oats"],
        image: "images/prairie-wheat.jpg"
    },
    {
        name: "Ontario Fresh Farms",
        address: "Lake Shore Blvd, Toronto, Canada",
        products: ["Corn", "Tomatoes", "Peppers", "Cucumbers"],
        image: "images/ontario-fresh.jpg"
    },
    {
        name: "Nova Scotia Orchards",
        address: "Atlantic Way, Halifax, Canada",
        products: ["Apples", "Pears", "Plums", "Cherries"],
        image: "images/nova-scotia.jpg"
    },
    {
        name: "Quebec Dairy Valley",
        address: "Rue Principale, Montreal, Canada",
        products: ["Cheese", "Milk", "Yogurt", "Butter"],
        image: "images/quebec-dairy.jpg"
    },
    {
        name: "Outback Cattle Station",
        address: "Red Earth Road, Darwin, Australia",
        products: ["Beef", "Leather", "Wool"],
        image: "images/outback-cattle.jpg"
    },
    {
        name: "Sunshine Coast Fruit Farm",
        address: "Pacific Way, Brisbane, Australia",
        products: ["Mangoes", "Pineapples", "Bananas", "Avocados"],
        image: "images/sunshine-coast.jpg"
    },
    {
        name: "Victoria Wine Valley",
        address: "Grape Lane, Melbourne, Australia",
        products: ["Grapes", "Wine", "Olives", "Cheese"],
        image: "images/victoria-wine.jpg"
    },
    {
        name: "Tasmania Apple Orchards",
        address: "Island Circuit, Hobart, Australia",
        products: ["Apples", "Pears", "Cherries", "Berries"],
        image: "images/tasmania-apple.jpg"
    },
    {
        name: "Western Wheat Belt",
        address: "Desert Road, Perth, Australia",
        products: ["Wheat", "Barley", "Canola", "Oats"],
        image: "images/western-wheat.jpg"
    },
    {
        name: "Alpine Dairy Collective",
        address: "Bergstrasse, Zurich, Switzerland",
        products: ["Swiss Cheese", "Alpine Butter", "Yogurt", "Cream"],
        image: "images/alpine-dairy.jpg"
    },
    {
        name: "Lucerne Valley Farm",
        address: "Seeweg, Lucerne, Switzerland",
        products: ["Herbs", "Mountain Tea", "Flowers", "Honey"],
        image: "images/lucerne-valley.jpg"
    },
    {
        name: "Geneva Vineyard Estate",
        address: "Lac Road, Geneva, Switzerland",
        products: ["Grapes", "Wine", "Fruit Preserves"],
        image: "images/geneva-vineyard.jpg"
    },
    {
        name: "Bernese Mountain Farm",
        address: "Alpweg, Bern, Switzerland",
        products: ["Cheese", "Mountain Herbs", "Wool", "Meat"],
        image: "images/bernese-mountain.jpg"
    },
    {
        name: "Swiss Chocolate Farm",
        address: "Kakaoweg, Basel, Switzerland",
        products: ["Cocoa", "Chocolate", "Dairy", "Nuts"],
        image: "images/swiss-chocolate.jpg"
    },
    {
        name: "Nigerian Cassava Estate",
        address: "Yam Street, Lagos, West Africa",
        products: ["Cassava", "Yams", "Plantains", "Palm Oil"],
        image: "images/nigerian-cassava.jpg"
    },
    {
        name: "Ghana Cocoa Plantation",
        address: "Cocoa Road, Accra, West Africa",
        products: ["Cocoa", "Plantains", "Coconuts", "Tropical Fruits"],
        image: "images/ghana-cocoa.jpg"
    },
    {
        name: "Ivory Coast Coffee Farm",
        address: "Coffee Lane, Abidjan, West Africa",
        products: ["Coffee", "Cocoa", "Cashews", "Mangoes"],
        image: "images/ivory-coast-coffee.jpg"
    },
    {
        name: "Senegal Rice Fields",
        address: "River Road, Dakar, West Africa",
        products: ["Rice", "Peanuts", "Millet", "Sorghum"],
        image: "images/senegal-rice.jpg"
    },
    {
        name: "Mali Cotton Plantation",
        address: "Sahel Street, Bamako, West Africa",
        products: ["Cotton", "Corn", "Millet", "Vegetables"],
        image: "images/mali-cotton.jpg"
    }
];

// Simulate API delay
async function fetchFarms() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFarms;
}

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const countryFilter = document.getElementById('country-filter');
    const searchResults = document.getElementById('search-results');

    let allFarms = await fetchFarms();

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

    function displayFarms(farmsToDisplay) {
        searchResults.innerHTML = farmsToDisplay.length ? 
            farmsToDisplay.map(farm => createFarmCard(farm)).join('') :
            '<div class="no-results">No farms found matching your criteria</div>';
    }

    // Trigger filtering on input and dropdown change
    searchInput.addEventListener('input', filterFarms);
    countryFilter.addEventListener('change', filterFarms);

    // Initial display
    displayFarms(allFarms);

    function createFarmCard(farm) {
        return `
            <div class="card">
                <div class="card-content">
                    <div class="card-header">
                        <h3>${farm.name}</h3>
                        <div class="card-info">
                            <p>${removeNumbers(farm.address)}</p>
                        </div>
                    </div>
                    <div class="products">
                        ${farm.products.map(product => 
                            `<span class="product-tag">${product}</span>`
                        ).join('')}
                    </div>
                    <button class="view-details-btn" data-farm='${JSON.stringify(farm)}'>View Details</button>
                </div>
            </div>
        `;
    }

    function showFarmDetails(farm) {
        const modal = document.getElementById('farmModal');
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="farm-detail-content">
                <div class="farm-detail-image-container">
                    <img src="${farm.image}" alt="${farm.name}" class="farm-detail-image">
                </div>
                <div class="farm-detail-info">
                    <h2>${farm.name}</h2>
                    <p><strong>Address:</strong> ${removeNumbers(farm.address)}</p>
                    <p><strong>Products:</strong></p>
                    <div class="farm-products-list">
                        ${farm.products.map(product => 
                            `<span class="product-tag">${product}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('show');
    }

    const modal = document.getElementById('farmModal');
    const closeModal = document.querySelector('.close-modal');

    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });

    searchResults.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details-btn')) {
            const farm = JSON.parse(e.target.getAttribute('data-farm'));
            showFarmDetails(farm);
        }
    });
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



