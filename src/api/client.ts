import axios from 'axios'
import { useNotificationStore } from '../components/GlobalNotification'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para inyectar el token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => { 
        const { showNotification } = useNotificationStore.getState();

        if (!error.response) {
            showNotification('Error de conexión: No se pudo establecer comunicación con el servidor', 'error');
        } else {
            const status = error.response.status;
            const detail = error.response.data?.detail;
            
            const errorMessage = Array.isArray(detail)
                ? detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
                : (typeof detail === 'string' ? detail : (detail ? JSON.stringify(detail) : null));

            switch (status) {
                case 401:
                    // Token expirado o inválido
                    showNotification('Sesión expirada o inválida. Por favor, inicie sesión nuevamente.', 'warning');
                    useAuthStore.getState().logout();
                    break;
                case 403:
                    showNotification(errorMessage || 'Acceso denegado: No tiene permisos para esta acción', 'error');
                    break;
                case 404:
                    // Silencioso para el console.error, ya que suele ser controlado por el componente
                    break;
                case 429:
                    showNotification('Demasiadas peticiones: Por favor, intente más tarde', 'warning');
                    break;
                case 500:
                    showNotification('Error en el servidor: Intente más tarde o contacte a soporte', 'error');
                    break;
                default:
                    console.error(`[API Error ${status}]:`, detail || error.message);
            }
        }

        return Promise.reject(error);
    }
);

export default api;