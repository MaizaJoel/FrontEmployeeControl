import axios from 'axios';

// ✅ Use environment variables for security and flexibility
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5038/api';

// Validate that the API URL is configured
if (!BASE_URL) {
    throw new Error(
        'VITE_API_BASE_URL is not defined. Please check your .env file.'
    );
}

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

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Avoid redirecting to login if we are in the public kiosk
            if (!window.location.pathname.startsWith('/kiosko')) {
                window.location.href = '/';
            }
        }

        if (error.response && error.response.status === 403) {
            alert("No tiene permisos para realizar esta acción.");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;