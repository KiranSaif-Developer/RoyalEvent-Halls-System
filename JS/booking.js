import { apiService } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. URL se Venue ID nikalna
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get('id');
    const session = JSON.parse(localStorage.getItem('userSession'));

    if (!venueId) {
        window.location.href = 'index.html';
        return;
    }

    // 2. User ka naam pehle se fill karna
    if (session) {
        document.getElementById('client_name').value = session.name;
    }

    // 3. Venue ki details display karna
    try {
        const venues = await apiService.fetchVenues();
        const venue = venues.find(v => v.id == venueId);
        if (venue) {
            document.getElementById('venue-name-display').textContent = `Request for ${venue.name}`;
        }
    } catch (err) {
        console.error("Venue detail fetch error:", err);
    }

    // 4. Form Submit Handler
    const bookingForm = document.getElementById('simple-booking-form');
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bookingData = {
            venueId: venueId,
            clientId: session ? session.id : "guest",
            clientName: document.getElementById('client_name').value,
            clientPhone: document.getElementById('client_phone').value,
            startTime: document.getElementById('start_time').value,
            endTime: document.getElementById('end_time').value,
            status: "pending", // Shuru mein pending hoga
            requestDate: new Date().toISOString()
        };

        try {
            // Hum apiService mein createBooking ka function call karenge
            await apiService.createBooking(bookingData);
            document.getElementById('message').style.color = "green";
            document.getElementById('message').textContent = "Success! Your request has been sent to the Admin.";
            
            // 3 second baad wapis index par bhej dein
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } catch (error) {
            document.getElementById('message').style.color = "red";
            document.getElementById('message').textContent = "Booking failed. Please try again.";
        }
    });
});
