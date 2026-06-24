import { apiService } from './api.js';

// --- 1. Navigation Update Logic ---
const updateNavigation = () => {
    const session = JSON.parse(localStorage.getItem('userSession'));
    const authLink = document.getElementById('auth-nav-link');

    if (session && authLink) {
        authLink.innerHTML = `
            <span style="color: #333; font-weight: bold;">Hello, ${session.name}</span> | 
            <a href="javascript:void(0)" id="logout-btn" style="color: red; text-decoration: none;">Logout</a>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('userSession');
            window.location.reload();
        });
    }
};

// --- 2. Image Carousel HTML Generator (UPDATED with Dots & Counter) ---
const createImageCarouselHTML = (venueId, venue) => {
    let images = [];
    
    // Admin array use kare ya single string, handle dono honge
    if (Array.isArray(venue.image_urls) && venue.image_urls.length > 0) {
        images = venue.image_urls;
    } else if (venue.image) {
        images = [venue.image];
    } else {
        images = ['images/placeholder.jpg'];
    }

    return `
        <div id="carousel-${venueId}" class="venue-card-carousel">
            <div class="carousel-track">
                ${images.map((url) => `
                    <div class="carousel-slide">
                        <img src="${url}" alt="Venue Photo" 
                             onerror="this.onerror=null;this.src='images/placeholder.jpg';">
                    </div>
                `).join('')}
            </div>
            
            ${images.length > 1 ? `
                <div class="slider-controls-overlay">
                    <div class="dots-container">
                        ${images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                    </div>
                    <div class="slide-number-display">
                        <span class="current-idx">1</span> / ${images.length}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};

// --- 3. Carousel Control Logic (Auto-Slide + UI Sync) ---
const setupCarouselListeners = () => {
    document.querySelectorAll('.venue-card-carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.dot');
        const currentLabel = carousel.querySelector('.current-idx');
        
        if (slides.length <= 1) return;

        let currentIndex = 0;

        const interval = setInterval(() => {
            if (!document.body.contains(carousel)) {
                clearInterval(interval);
                return;
            }

            currentIndex = (currentIndex + 1) % slides.length;
            
            // Slide Move Karna
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Dots Update Karna
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Counter Update Karna (e.g., 4 / 14)
            if (currentLabel) {
                currentLabel.innerText = currentIndex + 1;
            }
        }, 4000); // 4 seconds interval
    });
};

// --- 4. Venue Card Creation ---
const createVenueCard = (venue) => {
    const carouselHTML = createImageCarouselHTML(venue.id, venue); 
    if (venue.status === 'Inactive') return ''; 

    const displayRate = venue.price || venue.rate || venue.hourly_rate || 0;
    const capacity = venue.capacity || 'N/A';

    return `
        <div class="venue-card">
            ${carouselHTML}
            <div class="venue-details">
                <h3><a href="venue_detail.html?id=${venue.id}">${venue.name}</a></h3>
                <p><strong>Capacity:</strong> ${capacity} guests</p>
                <p><strong>Rate:</strong> Rs. ${displayRate} / hour</p>
                <p><strong>Location:</strong> ${venue.location}</p>
                <p class="venue-description">${venue.description || 'No description available.'}</p>
                <button onclick="window.checkAuthAndBook('${venue.id}')" class="btn-details">Request Booking</button>
            </div>
        </div>
    `;
};

// --- 5. Auth & Booking Logic ---
window.checkAuthAndBook = (venueId) => {
    const session = localStorage.getItem('userSession');
    if (!session) {
        alert("Please Login or Signup first!"); 
        if (typeof window.openAuthModal === "function") window.openAuthModal(); 
    } else {
        window.location.href = `booking_form.html?id=${venueId}`;
    }
}

// --- 6. Main Load Function ---
const loadVenues = async () => {
    const venueListElement = document.getElementById('venue-list');
    if (!venueListElement) return;

    try {
        const venues = await apiService.fetchVenues();
        const activeVenues = venues.filter(v => v.status !== 'Inactive');

        if (activeVenues.length === 0) {
            venueListElement.innerHTML = '<p class="no-data">No active venues found.</p>';
        } else {
            venueListElement.innerHTML = activeVenues.map(v => createVenueCard(v)).join('');
            setupCarouselListeners(); 
        }
        updateNavigation(); 
    } catch (error) {
        console.error("Connection Error:", error);
        venueListElement.innerHTML = '<p style="color: red; text-align: center;">Server connection error.</p>';
    }
};

document.addEventListener('DOMContentLoaded', loadVenues);