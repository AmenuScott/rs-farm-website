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

// Mock data for farms
const mockFarms = [
    // Canadian Farms
    {
        name: "Maple Valley Organics",
        address: "123 Fraser Valley Road, Vancouver, Canada",
        products: ["Maple Syrup", "Berries", "Apples", "Honey"],
        contact: "+1 604-555-0123"
    },
    {
        name: "Prairie Wheat Fields",
        address: "456 Saskatchewan Drive, Regina, Canada",
        products: ["Wheat", "Canola", "Barley", "Oats"],
        contact: "+1 306-555-0124"
    },
    {
        name: "Ontario Fresh Farms",
        address: "789 Lake Shore Blvd, Toronto, Canada",
        products: ["Corn", "Tomatoes", "Peppers", "Cucumbers"],
        contact: "+1 416-555-0125"
    },
    {
        name: "Nova Scotia Orchards",
        address: "321 Atlantic Way, Halifax, Canada",
        products: ["Apples", "Pears", "Plums", "Cherries"],
        contact: "+1 902-555-0126"
    },
    {
        name: "Quebec Dairy Valley",
        address: "567 Rue Principale, Montreal, Canada",
        products: ["Cheese", "Milk", "Yogurt", "Butter"],
        contact: "+1 514-555-0127"
    },

    // Australian Farms
    {
        name: "Outback Cattle Station",
        address: "101 Red Earth Road, Darwin, Australia",
        products: ["Beef", "Leather", "Wool"],
        contact: "+61 8-555-0128"
    },
    {
        name: "Sunshine Coast Fruit Farm",
        address: "202 Pacific Way, Brisbane, Australia",
        products: ["Mangoes", "Pineapples", "Bananas", "Avocados"],
        contact: "+61 7-555-0129"
    },
    {
        name: "Victoria Wine Valley",
        address: "303 Grape Lane, Melbourne, Australia",
        products: ["Grapes", "Wine", "Olives", "Cheese"],
        contact: "+61 3-555-0130"
    },
    {
        name: "Tasmania Apple Orchards",
        address: "404 Island Circuit, Hobart, Australia",
        products: ["Apples", "Pears", "Cherries", "Berries"],
        contact: "+61 3-555-0131"
    },
    {
        name: "Western Wheat Belt",
        address: "505 Desert Road, Perth, Australia",
        products: ["Wheat", "Barley", "Canola", "Oats"],
        contact: "+61 8-555-0132"
    },

    // Swiss Farms
    {
        name: "Alpine Dairy Collective",
        address: "111 Bergstrasse, Zurich, Switzerland",
        products: ["Swiss Cheese", "Alpine Butter", "Yogurt", "Cream"],
        contact: "+41 44-555-0133"
    },
    {
        name: "Lucerne Valley Farm",
        address: "222 Seeweg, Lucerne, Switzerland",
        products: ["Herbs", "Mountain Tea", "Flowers", "Honey"],
        contact: "+41 41-555-0134"
    },
    {
        name: "Geneva Vineyard Estate",
        address: "333 Lac Road, Geneva, Switzerland",
        products: ["Grapes", "Wine", "Fruit Preserves"],
        contact: "+41 22-555-0135"
    },
    {
        name: "Bernese Mountain Farm",
        address: "444 Alpweg, Bern, Switzerland",
        products: ["Cheese", "Mountain Herbs", "Wool", "Meat"],
        contact: "+41 31-555-0136"
    },
    {
        name: "Swiss Chocolate Farm",
        address: "555 Kakaoweg, Basel, Switzerland",
        products: ["Cocoa", "Chocolate", "Dairy", "Nuts"],
        contact: "+41 61-555-0137"
    },

    // West African Farms
    {
        name: "Nigerian Cassava Estate",
        address: "123 Yam Street, Lagos, West Africa",
        products: ["Cassava", "Yams", "Plantains", "Palm Oil"],
        contact: "+234 1-555-0138"
    },
    {
        name: "Ghana Cocoa Plantation",
        address: "456 Cocoa Road, Accra, West Africa",
        products: ["Cocoa", "Plantains", "Coconuts", "Tropical Fruits"],
        contact: "+233 302-555-0139"
    },
    {
        name: "Ivory Coast Coffee Farm",
        address: "789 Coffee Lane, Abidjan, West Africa",
        products: ["Coffee", "Cocoa", "Cashews", "Mangoes"],
        contact: "+225 22-555-0140"
    },
    {
        name: "Senegal Rice Fields",
        address: "321 River Road, Dakar, West Africa",
        products: ["Rice", "Peanuts", "Millet", "Sorghum"],
        contact: "+221 33-555-0141"
    },
    {
        name: "Mali Cotton Plantation",
        address: "654 Sahel Street, Bamako, West Africa",
        products: ["Cotton", "Corn", "Millet", "Vegetables"],
        contact: "+223 20-555-0142"
    }
];

// Farm images mapping (add more images as needed)
const farmImages = {
    'Canada': 'images/mapple.jpeg',
    'Australia': 'images/mapple.jpeg',
    'Switzerland': 'images/mapple.jpeg',
    'West Africa': 'images/mapple.jpeg'
};

// Replace the fetchFarms function with this:
async function fetchFarms() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFarms;
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
                    <button class="view-details-btn" onclick="showFarmDetails(${JSON.stringify(farm)
                        .replace(/"/g, '&quot;')})">View Details</button>
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

// Add modal functionality
function showFarmDetails(farm) {
    const modal = document.getElementById('farmModal');
    const modalBody = modal.querySelector('.modal-body');
    const country = farm.address.includes('Canada') ? 'Canada' 
                 : farm.address.includes('Australia') ? 'Australia'
                 : farm.address.includes('Switzerland') ? 'Switzerland'
                 : 'West Africa';
    
    modalBody.innerHTML = `
        <div class="farm-detail-content">
            <div class="farm-detail-image-container">
                <img src="${farmImages[country]}" alt="${farm.name}" class="farm-detail-image">
            </div>
            <div class="farm-detail-info">
                <h2>${farm.name}</h2>
                <p><strong>Address:</strong> ${farm.address}</p>
                <p><strong>Contact:</strong> ${farm.contact}</p>
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

// Add close modal functionality
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

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

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
});



