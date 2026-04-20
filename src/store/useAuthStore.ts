import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginService, register as registerService, getMe, logout as logoutService, updateUser as updateUserService } from '../api/authService';
import type { LoginInput, RegisterInput, UserResponse, UserUpdateInput } from '../api/types';

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
    error: string | null;
    
    login: (credentials: LoginInput, rememberMe?: boolean) => Promise<void>;
    register: (userData: RegisterInput) => Promise<void>;
    updateUser: (userData: UserUpdateInput) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            status: 'idle',
            error: null,

            login: async (credentials: LoginInput, rememberMe: boolean = false) => {
                set({ status: 'loading', error: null });
                try {
                    const { access_token } = await loginService(credentials, rememberMe);
                    set({ token: access_token });
                    
                    const user = await getMe();
                    set({ user, status: 'authenticated' });
                } catch (error: any) {
                    let message = 'Error en el inicio de sesión';
                    if (error.response?.data?.detail) {
                        message = typeof error.response.data.detail === 'string' 
                            ? error.response.data.detail 
                            : JSON.stringify(error.response.data.detail);
                    }
                    set({ status: 'unauthenticated', error: message });
                    throw error;
                }
            },

            register: async (userData: RegisterInput) => {
                set({ status: 'loading', error: null });
                try {
                    await registerService(userData);
                    set({ status: 'unauthenticated', error: null });
                } catch (error: any) {
                    let message = 'Error en el registro';
                    if (error.response?.data?.detail) {
                        message = typeof error.response.data.detail === 'string' 
                            ? error.response.data.detail 
                            : JSON.stringify(error.response.data.detail);
                    }
                    set({ status: 'unauthenticated', error: message });
                    throw error;
                }
            },

            updateUser: async (userData: UserUpdateInput) => {
                const { user } = get();
                if (!user) return;

                set({ status: 'loading', error: null });
                try {
                    const updatedUser = await updateUserService(user.id_usuario, userData);
                    set({ user: updatedUser, status: 'authenticated' });
                } catch (error: any) {
                    let message = 'Error al actualizar el perfil';
                    if (error.response?.data?.detail) {
                        message = typeof error.response.data.detail === 'string' 
                            ? error.response.data.detail 
                            : JSON.stringify(error.response.data.detail);
                    }
                    set({ status: 'authenticated', error: message });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await logoutService();
                } catch (error) {
                    console.error('Error logging out from server:', error);
                } finally {
                    set({ user: null, token: null, status: 'unauthenticated', error: null });
                }
            },

            clearError: () => set({ error: null }),

            checkAuth: async () => {
                const { token, user, status } = get();
                
                // Si no hay token, no estamos autenticados
                if (!token) {
                    set({ status: 'unauthenticated', user: null });
                    return;
                }

                // Si ya tenemos el usuario y el estado es autenticado (viniendo de persistencia),
                // no bloqueamos la UI con una nueva petición.
                if (user && status === 'authenticated') {
                    return;
                }

                // Si tenemos token pero no usuario (o queremos refrescar), llamamos a la API
                set({ status: 'loading' });
                try {
                    const userData = await getMe();
                    set({ user: userData, status: 'authenticated' });
                } catch (error) {
                    // Si el token es inválido o expiró
                    set({ user: null, token: null, status: 'unauthenticated' });
                }
            },
        }),
        { 
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user }), // Solo persistimos token y user
        }
    )
);
