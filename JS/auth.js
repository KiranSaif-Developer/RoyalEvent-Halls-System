import { fetchUsers, createUser } from './api.js';

// --- 1. Global Modal Control ---
window.openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'block';
};

window.closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
};

window.toggleAuth = (mode) => {
    const loginSec = document.getElementById('login-section');
    const signupSec = document.getElementById('signup-section');
    if (mode === 'signup') {
        loginSec.style.display = 'none';
        signupSec.style.display = 'block';
    } else {
        loginSec.style.display = 'block';
        signupSec.style.display = 'none';
    }
};

// --- 2. Session Management ---
const setSession = (user) => {
    localStorage.setItem('userSession', JSON.stringify({ 
        id: user.id, 
        role: user.role, 
        name: user.name
    }));
};

export const logout = () => {
    localStorage.removeItem('userSession');
    window.location.reload();
};

// --- 3. Login Logic (FIXED) ---
// auth.js - Final Admin Fix
const handleLogin = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const users = await fetchUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('userSession', JSON.stringify(user));
            
            // Debugging Alert: Ye aapko batayega ke DB mein role kya hai
            alert("Found User: " + user.name + " | Role: " + user.role);

            // Redirection Logic
            const role = (user.role || "").toString().toLowerCase().trim();

            if (role === 'admin') {
                console.log("Redirecting to admin dashboard...");
                window.location.href = 'admin_dashboard.html'; 
            } else {
                console.log("Redirecting to index...");
                window.location.href = 'index.html';
            }
        } else {
            alert("Login Failed: Email ya Password galat hai!");
        }
    } catch (err) {
        console.error("Critical Login Error:", err);
        alert("Server error! Kya JSON server chal raha hai?");
    }
};

// --- 4. Signup Logic (FIXED) ---
const handleSignup = async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-pass').value;

    try {
        const newUser = await createUser({ name, email, password, role: 'client' });
        setSession(newUser);
        alert("Account created successfully!");
        window.location.reload();
    } catch (error) {
        console.error("Signup failed:", error);
        alert("Signup failed. Please try again.");
    }
};

// --- Listeners Setup ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    
    document.getElementById('logout-btn')?.addEventListener('click', logout);
});
