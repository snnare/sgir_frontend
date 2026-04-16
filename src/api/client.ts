import axios from 'axios'
import { useNotificationStore } from '../components/GlobalNotification'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos de timeout
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
            try {
                const { state } = JSON.parse(authData);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('Error parsing auth-storage:', error);
            }
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
            // Error de red (No hay respuesta del servidor)
            showNotification('Error de conexión: No se pudo establecer comunicación con el servidor', 'error');
        } else {
            const status = error.response.status;
            const detail = error.response.data?.detail;

            switch (status) {
                case 403:
                    showNotification(detail || 'Acceso denegado: El sistema podría estar restringido', 'error');
                    break;
                case 429:
                    showNotification('Demasiadas peticiones: Por favor, intente más tarde', 'warning');
                    break;
                case 500:
                    showNotification('Error en el servidor: Intente más tarde o contacte a soporte', 'error');
                    break;
                default:
                    // Errores 400 (como Email ya registrado) se manejan localmente en los componentes,
                    // pero dejamos este log por si acaso.
                    console.error('API error:', detail || error.message);
            }
        }

        return Promise.reject(error);
    }
);

export default api;