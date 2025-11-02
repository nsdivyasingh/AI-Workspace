import axios from 'axios';

// IMPORTANT: Get the correct base URL
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'; 

// Create a custom Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Add interceptor to inject the token from local storage
api.interceptors.request.use(
    (config) => {
        // Get the token from local storage (key needs to be confirmed)
        const token = localStorage.getItem('token'); 

        if (token) {
            // Ensure the header format is correct for your backend middleware
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;