import { create } from 'zustand';
import { 
    getBackupPolicies, getBackupPaths, getBackupHistory 
} from '../api/backupService';
import type { BackupPolicy, BackupPath, BackupHistory } from '../api/types';

interface BackupState {
    policies: BackupPolicy[];
    paths: BackupPath[];
    history: BackupHistory[];
    loading: boolean;
    error: string | null;

    fetchPolicies: () => Promise<void>;
    fetchPaths: () => Promise<void>;
    fetchHistory: () => Promise<void>;
}

export const useBackupStore = create<BackupState>((set) => ({
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

    fetchPaths: async () => {
        set({ loading: true, error: null });
        try {
            const paths = await getBackupPaths();
            set({ paths, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
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
