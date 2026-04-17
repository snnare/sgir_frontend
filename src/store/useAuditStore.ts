import { create } from 'zustand';
import { getAuditLogs, getAuditEventTypes } from '../api/auditService';
import type { AuditLog, AuditEventType } from '../api/types';

interface AuditState {
    logs: AuditLog[];
    eventTypes: AuditEventType[];
    loading: boolean;
    error: string | null;

    fetchLogs: () => Promise<void>;
    fetchEventTypes: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
    logs: [],
    eventTypes: [],
    loading: false,
    error: null,

    fetchLogs: async () => {
        set({ loading: true, error: null });
        try {
            const logs = await getAuditLogs();
            set({ logs, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
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
