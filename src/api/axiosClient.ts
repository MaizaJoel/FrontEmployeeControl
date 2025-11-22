import axios from 'axios';

// ⚠️ Confirm this matches your Backend URL
const BASE_URL = 'https://localhost:7114/api';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Adds the token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 errors
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the server says "401 Unauthorized" (Token expired/invalid)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // 1. Remove the bad token
            localStorage.removeItem('token');

            // 2. Force redirect to Login (optional but recommended)
            // Note: Using window.location is a "hard" redirect, effective for security
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;