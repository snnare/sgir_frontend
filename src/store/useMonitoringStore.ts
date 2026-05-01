import { create } from 'zustand';
import { 
    getAlertsByServer, getAlertLevels, getMonitoringSummary, 
    getHostMetrics, getMySQLMetrics, getMongoDBMetrics,
    getSchedulerStatus, pauseScheduler, resumeScheduler, getLiveMetrics
} from '../api/monitoringService';
import type { 
    Alert, AlertLevel, MonitoringSummary, 
    HostMetrics, MySQLMetrics, MongoDBMetrics,
    SchedulerStatus, LiveMetrics
} from '../api/types';

interface MonitoringState {
    alerts: Alert[];
    alertLevels: AlertLevel[];
    summary: MonitoringSummary | null;
    hostMetrics: HostMetrics | null;
    mysqlMetrics: MySQLMetrics | null;
    mongodbMetrics: MongoDBMetrics | null;
    schedulerStatus: SchedulerStatus | null;
    liveMetrics: Record<number, LiveMetrics>; // Store live metrics per server ID
    loading: boolean;
    error: string | null;

    fetchAlertsByServer: (serverId: number) => Promise<void>;
    fetchAlertLevels: () => Promise<void>;
    fetchSummary: (serverId: number) => Promise<void>;
    fetchHostMetrics: (serverId: number, credId: number) => Promise<void>;
    fetchMySQLMetrics: (serverId: number, credId: number) => Promise<void>;
    fetchMongoDBMetrics: (serverId: number, credId: number) => Promise<void>;
    
    // Scheduler Actions
    fetchSchedulerStatus: () => Promise<void>;
    pauseMonitoring: () => Promise<void>;
    resumeMonitoring: () => Promise<void>;
    
    // Live Metrics Actions
    fetchLiveMetrics: (serverId: number) => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
    alerts: [],
    alertLevels: [],
    summary: null,
    hostMetrics: null,
    mysqlMetrics: null,
    mongodbMetrics: null,
    schedulerStatus: null,
    liveMetrics: {},
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

    fetchSchedulerStatus: async () => {
        try {
            const status = await getSchedulerStatus();
            set({ schedulerStatus: status });
        } catch (err: any) {
            console.error('Error fetching scheduler status:', err);
        }
    },

    pauseMonitoring: async () => {
        set({ loading: true });
        try {
            const status = await pauseScheduler();
            set({ schedulerStatus: status, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    resumeMonitoring: async () => {
        set({ loading: true });
        try {
            const status = await resumeScheduler();
            set({ schedulerStatus: status, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchLiveMetrics: async (serverId: number) => {
        try {
            const data = await getLiveMetrics(serverId);
            set((state) => ({
                liveMetrics: {
                    ...state.liveMetrics,
                    [serverId]: data
                }
            }));
        } catch (err: any) {
            console.error(`Error fetching live metrics for server ${serverId}:`, err);
        }
    }
}));
