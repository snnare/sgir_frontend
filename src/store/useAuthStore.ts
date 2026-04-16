import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginService, register as registerService, getMe, logout as logoutService } from '../api/authService';
import type { LoginInput, RegisterInput, UserResponse } from '../api/types';

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
    error: string | null;
    
    login: (credentials: LoginInput) => Promise<void>;
    register: (userData: RegisterInput) => Promise<void>;
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

            login: async (credentials: LoginInput) => {
                set({ status: 'loading', error: null });
                try {
                    const { access_token } = await loginService(credentials);
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
                const { token } = get();
                if (!token) {
                    set({ status: 'unauthenticated' });
                    return;
                }

                set({ status: 'loading' });
                try {
                    const user = await getMe();
                    set({ user, status: 'authenticated' });
                } catch (error) {
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
