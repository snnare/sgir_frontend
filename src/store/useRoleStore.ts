import { create } from 'zustand';
import { getRoles, getRoleById } from '../api/roleService';
import type { Role } from '../api/types';

interface RoleState {
    roles: Role[];
    loading: boolean;
    error: string | null;
    
    fetchRoles: () => Promise<void>;
    fetchRoleById: (id: number) => Promise<Role | null>;
}

export const useRoleStore = create<RoleState>((set) => ({
    roles: [],
    loading: false,
    error: null,

    fetchRoles: async () => {
        set({ loading: true, error: null });
        try {
            const roles = await getRoles();
            set({ roles, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Error al obtener roles', loading: false });
        }
    },

    fetchRoleById: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const role = await getRoleById(id);
            set({ loading: false });
            return role;
        } catch (error: any) {
            set({ error: error.message || 'Error al obtener el rol', loading: false });
            return null;
        }
    },
}));
