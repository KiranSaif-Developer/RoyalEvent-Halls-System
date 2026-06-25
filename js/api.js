const API_BASE_URL = 'https://6958e4136c3282d9f1d60e74.mockapi.io/event-booking';

// --- CORE CRUD OPERATIONS (Base Functions) ---

export const getData = async (endpoint, id = null) => {
    const url = id ? `${API_BASE_URL}/${endpoint}/${id}` : `${API_BASE_URL}/${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Get Error (${endpoint}):`, error);
        return id ? null : []; 
    }
};

export const postData = async (endpoint, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Post failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Post Error (${endpoint}):`, error);
        throw error;
    }
};

export const putData = async (endpoint, id, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Put failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Put Error (${endpoint}):`, error);
        throw error;
    }
};

export const deleteData = async (endpoint, id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Delete Error (${endpoint}):`, error);
        throw error;
    }
};

// --- MOCK ADMIN USERS ACTIONS (Frontend Fallback) ---

export const fetchUsers = async () => {
    return [{ id: "1", name: "Admin User", email: "admin@venue.com", password: "root", role: "admin" }];
};
export const fetchUserById = async (id) => {
    return { id: "1", name: "Admin User", email: "admin@venue.com", password: "root", role: "admin" };
};
export const createUser = async (userData) => userData;
export const updateUser = async (id, data) => data;

// --- VENUES ACTIONS ---

export const fetchVenues = () => getData('venues');
export const fetchVenueById = (id) => getData('venues', id); 
export const createVenue = (venueData) => postData('venues', venueData);
export const updateVenue = (id, data) => putData('venues', id, data);
export const deleteVenue = (id) => deleteData('venues', id);

// --- BOOKINGS ACTIONS ---

export const fetchAllBookings = () => getData('bookings');

export const createBooking = async (bookingData) => {
    // Net slow hone ki soorat mein keys miss na hon, isliye flat normalized schema banaya hai
    const normalizedData = {
        ...bookingData,
        venue_id: String(bookingData.venueId || bookingData.venue_id),
        venueId: String(bookingData.venueId || bookingData.venue_id),
        client_id: String(bookingData.clientId || bookingData.client_id || "guest"),
        clientId: String(bookingData.clientId || bookingData.client_id || "guest"),
        client_name: bookingData.clientName || bookingData.client_name || "Guest User",
        clientName: bookingData.clientName || bookingData.client_name || "Guest User",
        client_phone: bookingData.clientPhone || bookingData.client_phone || "N/A",
        clientPhone: bookingData.clientPhone || bookingData.client_phone || "N/A"
    };
    return postData('bookings', normalizedData);
};

export const updateBookingStatus = async (id, newStatus) => {
    try {
        // 1. Pehle single booking fetch karo taake baki fields safe rahein
        const getResponse = await fetch(`${API_BASE_URL}/bookings/${id}`);
        if (!getResponse.ok) throw new Error("Booking item not found on server");
        const existingBooking = await getResponse.json();

        // 2. Sirf status badlo aur baqi saara data backup mein rakho
        const updatedBooking = { ...existingBooking, status: newStatus };

        // 3. Wapas full object PUT kar do MockAPI par
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBooking),
        });
        
        if (!response.ok) throw new Error("Status update failed on MockAPI");
        return await response.json();
    } catch (err) {
        console.error("Error updating booking status:", err);
        throw err;
    }
};

export const fetchBookingsByClientId = async (clientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        if (!response.ok) throw new Error("Failed to fetch bookings list");
        const bookings = await response.json();
        return bookings.filter(b => String(b.client_id) === String(clientId) || String(b.clientId) === String(clientId));
    } catch (err) { 
        console.error("Error fetching client bookings:", err);
        return []; 
    }
};

// --- API SERVICE UNIFIED EXPORT ---

export const apiService = {
    getData, postData, putData, deleteData,
    fetchUsers, fetchUserById, createUser, updateUser,
    fetchVenues, fetchVenueById, createVenue, updateVenue, deleteVenue,
    fetchAllBookings, createBooking, updateBookingStatus, fetchBookingsByClientId
};
