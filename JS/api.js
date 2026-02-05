const API_BASE_URL = 'http://localhost:3000';
export const getData = async (endpoint, id = null) => {
    const url = id ? `${API_BASE_URL}/${endpoint}/${id}` : `${API_BASE_URL}/${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Get Error:", error);
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
        return await response.json();
    } catch (error) {
        console.error("API Post Error:", error);
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
        return await response.json();
    } catch (error) {
        console.error("API Put Error:", error);
        throw error;
    }
};

export const deleteData = async (endpoint, id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error) {
        console.error("API Delete Error:", error);
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
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if(!response.ok) throw new Error("Status update failed");
        return await response.json();
    } catch (err) {
        console.error(err);
    }
};

export const fetchBookingsByClientId = async (clientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings?client_id=${clientId}`);
        return await response.json();
    } catch (err) { return []; }
};

export const apiService = {
    getData, postData, putData, deleteData,
    fetchUsers, fetchUserById, createUser, updateUser,
    fetchVenues, fetchVenueById, createVenue, updateVenue, deleteVenue,
    fetchAllBookings, createBooking, updateBookingStatus, fetchBookingsByClientId
};
