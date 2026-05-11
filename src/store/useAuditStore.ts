import { create } from 'zustand';
import { getAuditLogs, getAuditEventTypes } from '../api/auditService';
import type { AuditLog, AuditEventType } from '../api/types';

interface AuditState {
    logs: AuditLog[];
    eventTypes: AuditEventType[];
    loading: boolean;
    error: string | null;
    skip: number;
    limit: number;
    hasMore: boolean;

    fetchLogs: (reset?: boolean) => Promise<void>;
    loadMoreLogs: () => Promise<void>;
    fetchEventTypes: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => ({
    logs: [],
    eventTypes: [],
    loading: false,
    error: null,
    skip: 0,
    limit: 50,
    hasMore: true,

    fetchLogs: async (reset = true) => {
        const { skip, limit } = get();
        const currentSkip = reset ? 0 : skip;
        
        set({ loading: true, error: null });
        try {
            const newLogs = await getAuditLogs(currentSkip, limit);
            set((state) => ({ 
                logs: reset ? newLogs : [...state.logs, ...newLogs], 
                loading: false,
                skip: currentSkip + newLogs.length,
                hasMore: newLogs.length === limit
            }));
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    loadMoreLogs: async () => {
        const { loading, hasMore } = get();
        if (loading || !hasMore) return;
        await get().fetchLogs(false);
    },

    fetchEventTypes: async () => {
        set({ loading: true, error: null });
        try {
            const eventTypes = await getAuditEventTypes();
            set({ eventTypes, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));
