// js/client_history.js

import { getSession } from './auth.js';
import { fetchBookingsByClientId, fetchVenues } from './api.js';

// --- MAIN CONTROL LOGIC ---
const initClientHistory = async () => {
    const session = getSession();

    if (!session || session.role !== 'client') {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('client-name-display').textContent = session.name;

    const [clientBookings, allVenues] = await Promise.all([
        fetchBookingsByClientId(session.id),
        fetchVenues()
    ]);
    
    const venueMap = allVenues.reduce((map, venue) => {
        map[venue.id] = venue;
        return map;
    }, {});
    
    renderClientBookings(clientBookings, venueMap);
};


// --- RENDER FUNCTION ---
const renderClientBookings = (bookings, venueMap) => {
    const tableBody = document.getElementById('client-bookings-body');
    const noBookingsMsg = document.getElementById('no-bookings-msg');

    tableBody.innerHTML = '';
    
    if (bookings.length === 0) {
        noBookingsMsg.style.display = 'block';
        return;
    }
    
    noBookingsMsg.style.display = 'none';

    bookings.forEach(booking => {
        const venue = venueMap[booking.venue_id];
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${venue ? venue.name : 'Unknown Venue'}</td>
            <td>${new Date(booking.start_time).toLocaleString()}</td>
            <td>${new Date(booking.end_time).toLocaleString()}</td>
            <td class="status-${booking.status}"><strong>${booking.status.toUpperCase()}</strong></td>
        `;
    });
};

initClientHistory();
