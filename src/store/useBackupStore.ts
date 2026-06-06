import { create } from 'zustand';
import { 
    getBackupPolicies, createBackupPolicy, updateBackupPolicy, deleteBackupPolicy,
    getBackupPaths, getBackupHistory, createBackupPath, updateBackupPath, deleteBackupPath
} from '../api/backupService';
import type { BackupPolicy, BackupPath, BackupHistory, BackupPolicyCreateInput, BackupPathCreateInput } from '../api/types';

interface BackupState {
    policies: BackupPolicy[];
    paths: BackupPath[];
    history: BackupHistory[];
    loading: boolean;
    error: string | null;

    fetchPolicies: () => Promise<void>;
    addPolicy: (policy: BackupPolicyCreateInput) => Promise<BackupPolicy>;
    updatePolicy: (id: number, policy: Partial<BackupPolicyCreateInput>) => Promise<void>;
    deletePolicy: (id: number) => Promise<void>;
    
    fetchPaths: () => Promise<void>;
    addPath: (path: BackupPathCreateInput) => Promise<void>;
    updatePath: (id: number, path: BackupPathCreateInput) => Promise<void>;
    deletePath: (id: number) => Promise<void>;
    fetchHistory: () => Promise<void>;
}

export const useBackupStore = create<BackupState>((set, get) => ({
    policies: [],
    paths: [],
    history: [],
    loading: false,
    error: null,

    fetchPolicies: async () => {
        set({ loading: true, error: null });
        try {
            const policies = await getBackupPolicies();
            set({ policies, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    addPolicy: async (policyData) => {
        set({ loading: true, error: null });
        try {
            const newPolicy = await createBackupPolicy(policyData);
            set({ 
                policies: [...get().policies, newPolicy], 
                loading: false 
            });
            return newPolicy;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    updatePolicy: async (id, policyData) => {
        set({ loading: true, error: null });
        try {
            const updatedPolicy = await updateBackupPolicy(id, policyData);
            set({ 
                policies: get().policies.map(p => p.id_politica === id ? updatedPolicy : p),
                loading: false 
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    deletePolicy: async (id) => {
        set({ loading: true, error: null });
        try {
            await deleteBackupPolicy(id);
            set({ 
                policies: get().policies.filter(p => p.id_politica !== id),
                loading: false 
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    fetchPaths: async () => {
        set({ loading: true, error: null });
        try {
            const paths = await getBackupPaths();
            set({ paths, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    addPath: async (pathData) => {
        set({ loading: true, error: null });
        try {
            const newPath = await createBackupPath(pathData);
            set({ 
                paths: [...get().paths, newPath], 
                loading: false 
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    updatePath: async (id, pathData) => {
        set({ loading: true, error: null });
        try {
            const updatedPath = await updateBackupPath(id, pathData);
            set({ 
                paths: get().paths.map(p => p.id_ruta === id ? updatedPath : p),
                loading: false 
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    deletePath: async (id) => {
        set({ loading: true, error: null });
        try {
            await deleteBackupPath(id);
            set({ 
                paths: get().paths.filter(p => p.id_ruta !== id),
                loading: false 
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    fetchHistory: async () => {
        set({ loading: true, error: null });
        try {
            const history = await getBackupHistory();
            set({ history, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));
