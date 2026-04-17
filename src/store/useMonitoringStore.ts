import { create } from 'zustand';
import { 
    getAlertsByServer, getAlertLevels, getMonitoringSummary, 
    getHostMetrics, getMySQLMetrics, getMongoDBMetrics 
} from '../api/monitoringService';
import type { 
    Alert, AlertLevel, MonitoringSummary, 
    HostMetrics, MySQLMetrics, MongoDBMetrics 
} from '../api/types';

interface MonitoringState {
    alerts: Alert[];
    alertLevels: AlertLevel[];
    summary: MonitoringSummary | null;
    hostMetrics: HostMetrics | null;
    mysqlMetrics: MySQLMetrics | null;
    mongodbMetrics: MongoDBMetrics | null;
    loading: boolean;
    error: string | null;

    fetchAlertsByServer: (serverId: number) => Promise<void>;
    fetchAlertLevels: () => Promise<void>;
    fetchSummary: (serverId: number) => Promise<void>;
    fetchHostMetrics: (serverId: number, credId: number) => Promise<void>;
    fetchMySQLMetrics: (serverId: number, credId: number) => Promise<void>;
    fetchMongoDBMetrics: (serverId: number, credId: number) => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
    alerts: [],
    alertLevels: [],
    summary: null,
    hostMetrics: null,
    mysqlMetrics: null,
    mongodbMetrics: null,
    loading: false,
    error: null,

    fetchAlertsByServer: async (serverId: number) => {
        set({ loading: true, error: null });
        try {
            const alerts = await getAlertsByServer(serverId);
            set({ alerts, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchAlertLevels: async () => {
        set({ loading: true, error: null });
        try {
            const alertLevels = await getAlertLevels();
            set({ alertLevels, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchSummary: async (serverId: number) => {
        set({ loading: true, error: null });
        try {
            const summary = await getMonitoringSummary(serverId);
            set({ summary, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchHostMetrics: async (serverId: number, credId: number) => {
        set({ loading: true, error: null });
        try {
            const hostMetrics = await getHostMetrics(serverId, credId);
            set({ hostMetrics, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchMySQLMetrics: async (serverId: number, credId: number) => {
        set({ loading: true, error: null });
        try {
            const mysqlMetrics = await getMySQLMetrics(serverId, credId);
            set({ mysqlMetrics, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchMongoDBMetrics: async (serverId: number, credId: number) => {
        set({ loading: true, error: null });
        try {
            const mongodbMetrics = await getMongoDBMetrics(serverId, credId);
            set({ mongodbMetrics, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));
