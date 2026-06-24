const BIN_URL = 'https://api.jsonbin.io/v3/b/6a3c2408da38895dfef8e2ef';
// ⚠️ Yahan apni asli Master Key daalo jo $2a$10$ se shuru hoti hai
const API_KEY = '$2a$10$jXZH5q6tHcuU32mDjyCspOYf.np3avwl8raUQoM0ShCAuEDqHGY4y'; 

// Helper function: JSONBin se poora data read karne ke liye
const fetchBinData = async () => {
    const response = await fetch(BIN_URL, {
        headers: { 
            "X-Bin-Meta": "false",
            "X-Master-Key": API_KEY  
        }
    });
    if (!response.ok) throw new Error("JSONBin fetch failed");
    return await response.json();
};

// Helper function: JSONBin par poora data save karne ke liye
const updateBinData = async (newData) => {
    const response = await fetch(BIN_URL, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            "X-Master-Key": API_KEY 
        },
        body: JSON.stringify(newData)
    });
    if (!response.ok) throw new Error("JSONBin update failed");
    return await response.json();
};

export const getData = async (endpoint, id = null) => {
    try {
        const data = await fetchBinData();
        const array = data[endpoint] || [];
        if (id) {
            return array.find(item => String(item.id) === String(id)) || null;
        }
        return array;
    } catch (error) {
        console.error(`API Get Error (${endpoint}):`, error);
        return id ? null : []; 
    }
};

export const postData = async (endpoint, payload) => {
    try {
        const data = await fetchBinData();
        if (!data[endpoint]) data[endpoint] = [];
        if (!payload.id) payload.id = String(Date.now());
        data[endpoint].push(payload);
        await updateBinData(data);
        return payload;
    } catch (error) {
        console.error(`API Post Error (${endpoint}):`, error);
        throw error;
    }
};

export const putData = async (endpoint, id, payload) => {
    try {
        const data = await fetchBinData();
        const array = data[endpoint] || [];
        const index = array.findIndex(item => String(item.id) === String(id));
        if (index !== -1) {
            array[index] = { ...array[index], ...payload };
            await updateBinData(data);
            return array[index];
        }
        throw new Error("Item not found for update");
    } catch (error) {
        console.error(`API Put Error (${endpoint}):`, error);
        throw error;
    }
};

export const deleteData = async (endpoint, id) => {
    try {
        const data = await fetchBinData();
        const array = data[endpoint] || [];
        const filtered = array.filter(item => String(item.id) !== String(id));
        data[endpoint] = filtered;
        await updateBinData(data);
        return { success: true };
    } catch (error) {
        console.error(`API Delete Error (${endpoint}):`, error);
        throw error;
    }
};

export const fetchUsers = () => getData('users');
export const fetchUserById = (id) => getData('users', id);
export const createUser = (userData) => postData('users', userData);
export const updateUser = (id, data) => putData('users', id, data);

export const fetchVenues = () => getData('venues');
export const fetchVenueById = (id) => getData('venues', id); 

export const createVenue = (venueData) => postData('venues', venueData);
export const updateVenue = (id, data) => putData('venues', id, data);
export const deleteVenue = (id) => deleteData('venues', id);

export const fetchAllBookings = () => getData('bookings');
export const createBooking = (bookingData) => postData('bookings', bookingData);

export const updateBookingStatus = async (id, newStatus) => {
    try {
        const data = await fetchBinData();
        const bookings = data.bookings || [];
        const booking = bookings.find(b => String(b.id) === String(id));
        if (booking) {
            booking.status = newStatus;
            await updateBinData(data);
            return booking;
        }
        throw new Error("Booking not found");
    } catch (err) {
        console.error("Status update failed:", err);
    }
};

export const fetchBookingsByClientId = async (clientId) => {
    try {
        const data = await fetchBinData();
        const bookings = data.bookings || [];
        return bookings.filter(b => String(b.client_id) === String(clientId));
    } catch (err) { 
        return []; 
    }
};

export const apiService = {
    getData, postData, putData, deleteData,
    fetchUsers, fetchUserById, createUser, updateUser,
    fetchVenues, fetchVenueById, createVenue, updateVenue, deleteVenue,
    fetchAllBookings, createBooking, updateBookingStatus, fetchBookingsByClientId
};
