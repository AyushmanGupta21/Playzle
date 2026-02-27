import axios from 'axios';
import { useGameStore } from '../store/gameStore';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
    const token = useGameStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            useGameStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
