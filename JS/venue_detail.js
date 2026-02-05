import { fetchVenueById } from './api.js'; 

// Helper: Check login status
const isLoggedIn = () => {
    // LocalStorage aur Session dono check kar rahe hain secure rehne ke liye
    return localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('user');
};

const renderVenueDetails = (venue) => {
    const container = document.getElementById('venue-detail-container');
    if (!venue || !container) return;

    const rawRate = venue.hourly_rate || venue.price || 0;
    const formattedRate = Number(rawRate).toFixed(2);

    document.getElementById('page-title').textContent = `${venue.name} | Royal Event Halls`;
    
    const images = Array.isArray(venue.image_urls) ? venue.image_urls : [venue.image || 'images/placeholder.jpg'];
    
    container.innerHTML = `
        <div class="venue-detail-header">
            <h1>${venue.name}</h1>
            <p class="location-tag"><i class="fas fa-map-marker-alt"></i> ${venue.location}</p>
        </div>

        <div class="venue-image-carousel-main venue-detail-carousel">
            <div class="carousel-track">
                ${images.map(url => `
                    <div class="carousel-slide">
                        <img src="${url}" alt="Venue Photo" onerror="this.src='images/placeholder.jpg'">
                    </div>
                `).join('')}
            </div>
            ${images.length > 1 ? `
                <button class="carousel-control prev">❮</button>
                <button class="carousel-control next">❯</button>
            ` : ''}
        </div>

        <div class="venue-detail-grid">
            <div class="description-block">
                <h2>The Space</h2>
                <p>${venue.description || 'Welcome to our premium event space.'}</p>
                <h3>Key Features</h3>
                <ul class="features-list">
                    <li><strong>Capacity:</strong> ${venue.capacity || 'N/A'} guests</li>
                    <li><strong>Rate:</strong> Rs. ${formattedRate} / hour</li>
                </ul>
            </div>

            <div class="booking-block">
                <div class="booking-card">
                    <h2>Book This Hall</h2>
                    <p class="rate-display">Starting at <strong>Rs. ${formattedRate}</strong> per hour</p>
                    <!-- ID added here for selection -->
                    <button id="request-booking-btn" class="btn btn-primary btn-large">Request Your Booking</button>
                    <p class="info-text">Fast response within 24 hours.</p>
                </div>
            </div>
        </div>
    `;

    // --- Auth Guard Logic (Must be inside after innerHTML) ---
    const bookingBtn = document.getElementById('request-booking-btn');
    if (bookingBtn) {
        bookingBtn.onclick = (e) => {
            if (!isLoggedIn()) {
                e.preventDefault(); // Link ko kaam karne se rokna
                alert("Kiran, please login first to book this venue!");
                window.location.href = 'index.html?action=login'; 
            } else {
                // Agar login hai toh booking form page par bhej do
                window.location.href = `booking_form.html?id=${venue.id}`;
            }
        };
    }
    
    if (images.length > 1) setupSimpleCarousel();
};

// --- Carousel Logic ---
const setupSimpleCarousel = () => {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    let index = 0;

    const move = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
    };

    nextBtn?.addEventListener('click', () => {
        index = (index + 1) % slides.length;
        move();
    });

    prevBtn?.addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        move();
    });
};

// --- Initialization ---
const initVenueDetailPage = async () => {
    const params = new URLSearchParams(window.location.search);
    const venueId = params.get('id');
    if (!venueId) return;

    try {
        const venue = await fetchVenueById(venueId); 
        venue ? renderVenueDetails(venue) : (document.getElementById('venue-detail-container').innerHTML = "<h2>Venue not found!</h2>");
    } catch (error) {
        console.error("Error:", error);
    }
};

initVenueDetailPage();
