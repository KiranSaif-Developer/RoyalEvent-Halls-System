import { getData, postData, putData, deleteData } from './api.js';

const venueList = document.getElementById('admin-venue-list');
const bookingList = document.getElementById('admin-booking-list');
const venueForm = document.getElementById('venue-form');
const venueModal = document.getElementById('venue-modal');
const modalTitle = document.getElementById('modal-title');

async function initAdmin() {
    loadVenues();
    loadBookings();
}

// ---  Load Venues Table ---
async function loadVenues() {
    const venues = await getData('venues');
    venueList.innerHTML = venues.map(v => {
        // Formula: Fallback to ensure price/image always exist
        const price = v.price || v.rate || v.hourly_rate || "0";
        const displayImage = (v.image_urls && v.image_urls.length > 0) ? v.image_urls[0] : (v.image || 'images/placeholder.jpg');

        return `
            <tr>
                <td><img src="${displayImage}" width="50" height="50" style="border-radius:4px; object-fit:cover;" onerror="this.src='images/placeholder.jpg'"></td>
                <td>${v.name || 'Unnamed Venue'}</td>
                <td>${v.location || 'No Location'}</td>
                <td>Rs. ${price}</td>
                <td>
                    <button class="btn-approve" onclick="editVenue('${v.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-reject" onclick="removeVenue('${v.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

// ---  Edit Venue (Global attach kiya hai taake HTML dhoond sakay) ---
window.editVenue = async (id) => {
    const venues = await getData('venues');
    const v = venues.find(item => String(item.id) === String(id));
    if(!v) return;

    document.getElementById('edit-venue-id').value = v.id;
    document.getElementById('v-name').value = v.name || "";
    document.getElementById('v-location').value = v.location || "";
    document.getElementById('v-price').value = v.price || v.rate || "";
    document.getElementById('v-capacity').value = v.capacity || "";
    document.getElementById('v-description').value = v.description || "";
    
    // Multiple images handle karna
    const imagesVal = Array.isArray(v.image_urls) ? v.image_urls.join(', ') : (v.image || "");
    document.getElementById('v-image').value = imagesVal;
    
    modalTitle.innerText = "Edit Venue";
    venueModal.style.display = 'block';
}

// ---  Save / Update Logic ---
venueForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-venue-id').value;
    
    const rawImages = document.getElementById('v-image').value;
    const imagesArray = rawImages.split(',').map(url => url.trim()).filter(url => url !== "");

    const venueData = {
        name: document.getElementById('v-name').value,
        location: document.getElementById('v-location').value,
        price: document.getElementById('v-price').value,
        rate: document.getElementById('v-price').value, // Dono keys save kar rahe hain safety ke liye
        capacity: document.getElementById('v-capacity').value,
        description: document.getElementById('v-description').value,
        image_urls: imagesArray,
        image: imagesArray[0] || "" 
    };

    try {
        if(id) {
            await putData('venues', id, venueData);
            alert("Mubarak ho Kiran! Venue update ho gaya.");
        } else {
            await postData('venues', venueData);
            alert("Naya Venue add ho gaya!");
        }
        
        venueModal.style.display = 'none';
        venueForm.reset();
        loadVenues(); 
    } catch (err) {
        console.error("Save error:", err);
        alert("Save nahi ho saka. Check console.");
    }
});

// ---  Remove Venue ---
window.removeVenue = async (id) => {
    if(confirm("Kiran, are you sure you want to delete this venue?")) {
        await deleteData('venues', id);
        loadVenues(); 
    }
}

// --- Fix: Update Booking Status (Ye missing tha!) ---
window.updateStatus = async (id, newStatus) => {
    try {
        // PATCH request taake sirf status update ho
        await putData('bookings', id, { status: newStatus.toLowerCase() });
        alert(`Booking is now ${newStatus}`);
        loadBookings(); // Refresh list
    } catch (err) {
        console.error("Status update error:", err);
        alert("Status update fail ho gaya.");
    }
};

// ---  Bookings Management ---
async function loadBookings() {
    try {
        const [bookings, venues, users] = await Promise.all([
            getData('bookings'), 
            getData('venues'), 
            getData('users')
        ]);

        bookingList.innerHTML = bookings.map(b => {
            const bClientId = b.client_id || b.userId || b.clientId;
            const bVenueId = b.venue_id || b.venueId;

            const venue = venues.find(v => String(v.id) === String(bVenueId));
            const user = users.find(u => String(u.id) === String(bClientId));
            
            const status = (b.status || 'pending').toLowerCase();
            const clientDisplay = user ? (user.name || user.email) : `ID: ${bClientId}`;
            const venueDisplay = venue ? venue.name : 'Unknown Venue';
            const dateDisplay = b.date || b.start_time || 'N/A';

            return `
                <tr>
                    <td>${venueDisplay}</td>
                    <td><strong>${clientDisplay}</strong></td>
                    <td>${dateDisplay}</td>
                    <td><span class="status-badge status-${status}">${status.toUpperCase()}</span></td>
                    <td>
                        ${status === 'pending' ? `
                            <button class="btn-approve" onclick="window.updateStatus('${b.id}', 'Approved')">Accept</button>
                            <button class="btn-reject" onclick="window.updateStatus('${b.id}', 'Rejected')">Reject</button>
                        ` : '<i class="fas fa-check-circle" style="color:#28a745"></i> Done'}
                    </td>
                </tr>`;
        }).join('');
    } catch (err) { 
        console.error("Booking load error:", err); 
    }
}

// Modal Controls
document.getElementById('open-add-modal').onclick = () => {
    venueForm.reset();
    document.getElementById('edit-venue-id').value = "";
    modalTitle.innerText = "Add New Venue";
    venueModal.style.display = 'block';
};

const closeBtn = document.querySelector('.modal-close-x') || document.querySelector('.close');
if(closeBtn) closeBtn.onclick = () => venueModal.style.display = 'none';

// Logout Logic
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm("Kiran, are you sure you want to logout?")) {
            localStorage.removeItem('userSession');
            window.location.href = 'login.html';
        }
    });
}

initAdmin();
