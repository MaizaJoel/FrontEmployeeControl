import axios from 'axios';

// ⚠️ CAMBIA ESTA URL por la que te da Swagger (ej. https://localhost:7114/api)
const BASE_URL = 'https://localhost:7114/api';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: Agrega el token automáticamente a cada petición
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;