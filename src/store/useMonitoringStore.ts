import { create } from 'zustand';
import { 
    getAlertsByServer, getAlertLevels, getMonitoringSummary, 
    getHostMetrics, getMySQLMetrics, getMongoDBMetrics,
    getSchedulerStatus, pauseScheduler, resumeScheduler, getHealthStatus,
    getGlobalSummary, getMonitoringSessions, getMonitoringStatus,
    getAlerts, getLiveCache, getAlertsToday, getAlertsRecent
} from '../api/monitoringService';
import { databaseService } from '../api/databaseService';
import type { 
    Alert, AlertLevel, MonitoringSummary, 
    HostMetrics, MySQLMetrics, MongoDBMetrics,
    SchedulerStatus, HealthStatus, GlobalSummary,
    MonitoringSession, MonitoringSessionDetail,
    DBInstanceHealth, DBGlobalSummary, DBDiscoveryResponse
} from '../api/types';
import { useInfrastructureStore } from './useInfrastructureStore';

interface MonitoringState {
    alerts: Alert[];
    alertLevels: AlertLevel[];
    summary: MonitoringSummary | null;
    globalSummary: GlobalSummary | null;
    hostMetrics: HostMetrics | null;
    mysqlMetrics: MySQLMetrics | null;
    mongodbMetrics: MongoDBMetrics | null;
    schedulerStatus: SchedulerStatus | null;
    liveMetrics: Record<number, HealthStatus>; // Store health status per server ID
    sessions: MonitoringSession[];
    sessionDetail: MonitoringSessionDetail | null;
    loading: boolean;
    error: string | null;

    // --- Monitoreo de Bases de Datos ---
    databaseMetrics: {
        instances: DBInstanceHealth[];
        summary: DBGlobalSummary | null;
        isLoading: boolean;
        error: string | null;
    };

    fetchAlertsByServer: (serverId: number) => Promise<void>;
    fetchAlerts: () => Promise<void>;
    fetchAlertsToday: () => Promise<void>;
    fetchAlertsRecent: (limit?: number) => Promise<void>;
    fetchAlertLevels: () => Promise<void>;
    fetchSummary: (serverId: number) => Promise<void>;
    fetchGlobalSummary: () => Promise<void>;
    fetchHostMetrics: (serverId: number, credId: number) => Promise<void>;
    fetchMySQLMetrics: (serverId: number, credId: number) => Promise<void>;
    fetchMongoDBMetrics: (serverId: number, credId: number) => Promise<void>;
    
    // History Actions
    fetchMonitoringSessions: () => Promise<void>;
    fetchMonitoringDetail: (id: number) => Promise<void>;
    
    // Scheduler Actions
    fetchSchedulerStatus: () => Promise<void>;
    pauseMonitoring: () => Promise<void>;
    resumeMonitoring: () => Promise<void>;
    
    // Live Metrics Actions
    fetchHealthStatus: (serverId: number) => Promise<void>;
    fetchLiveCache: () => Promise<void>;

    // DB Monitoring Actions
    fetchDBGlobalSummary: () => Promise<void>;
    fetchDBLiveCache: () => Promise<void>;
    triggerDBDiscoverAll: () => Promise<DBDiscoveryResponse>;
    refreshDBInstanceMetrics: (instanciaId: number) => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
    alerts: [],
    alertLevels: [],
    summary: null,
    globalSummary: null,
    hostMetrics: null,
    mysqlMetrics: null,
    mongodbMetrics: null,
    schedulerStatus: null,
    liveMetrics: {},
    sessions: [],
    sessionDetail: null,
    loading: false,
    error: null,

    databaseMetrics: {
        instances: [],
        summary: null,
        isLoading: false,
        error: null,
    },

    fetchAlertsByServer: async (serverId: number) => {
        set({ loading: true, error: null });
        try {
            const alerts = await getAlertsByServer(serverId);
            set({ alerts, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchAlerts: async () => {
        set({ loading: true, error: null });
        try {
            const alerts = await getAlerts();
            set({ alerts, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchAlertsToday: async () => {
        set({ loading: true, error: null });
        try {
            const alerts = await getAlertsToday();
            set({ alerts, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchAlertsRecent: async (limit: number = 50) => {
        set({ loading: true, error: null });
        try {
            const alerts = await getAlertsRecent(limit);
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

    fetchGlobalSummary: async () => {
        try {
            const globalSummary = await getGlobalSummary();
            set({ globalSummary });
        } catch (err: any) {
            console.error('Error fetching global summary:', err);
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

    fetchMonitoringSessions: async () => {
        set({ loading: true, error: null });
        try {
            const sessions = await getMonitoringSessions();
            set({ sessions, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchMonitoringDetail: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const sessionDetail = await getMonitoringStatus(id);
            set({ sessionDetail, loading: false });
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

    fetchHealthStatus: async (serverId: number) => {
        try {
            const data = await getHealthStatus(serverId);
            set((state) => ({
                liveMetrics: {
                    ...state.liveMetrics,
                    [serverId]: data
                }
            }));
        } catch (err: any) {
            console.error(`Error fetching health status for server ${serverId}:`, err);
        }
    },

    fetchLiveCache: async () => {
        try {
            const data = await getLiveCache();
            // console.log('[MonitoringStore] Live Cache raw data:', data);
            
            if (Object.keys(data).length === 0) {
                console.warn('[MonitoringStore] Live Cache is empty. Falling back to individual polling.');
                const { servers } = useInfrastructureStore.getState();
                
                if (servers.length > 0) {
                    await Promise.all(servers.map(async (server) => {
                        try {
                            const individualData = await getHealthStatus(server.id_servidor);
                            set((state) => ({
                                liveMetrics: { ...state.liveMetrics, [server.id_servidor]: individualData }
                            }));
                        } catch (err) {
                            console.error(`[MonitoringStore] Error fetching for server ${server.id_servidor}:`, err);
                        }
                    }));
                    return;
                }
            }

            // Procesamos el caché. El backend envía Record<number, HealthStatus | string | any>
            const mappedMetrics: Record<number, HealthStatus> = {};
            
            Object.entries(data).forEach(([id, info]: [string, any]) => {
                const serverId = parseInt(id);
                let parsedHealth: HealthStatus | null = null;

                if (typeof info === 'string') {
                    const parts = info.split('|');
                    if (parts.length >= 8) {
                        // Caso: status|last_check|is_stale|cpu|ram|disks|uptime|timestamp
                        const [status, last_check, is_stale, cpu, ram, disksRaw, uptime, timestamp] = parts;
                        parsedHealth = {
                            status: status as any,
                            last_check,
                            is_stale: is_stale === 'true',
                            live_metrics: parseLiveMetricsString(`${cpu}|${ram}|${disksRaw}|${uptime}|${timestamp}`)
                        };
                    } else {
                        // Caso: cpu|ram|disks|uptime|timestamp
                        parsedHealth = {
                            status: 'healthy',
                            last_check: new Date().toISOString(),
                            is_stale: false,
                            live_metrics: parseLiveMetricsString(info)
                        };
                    }
                } else if (info && typeof info === 'object') {
                    if ('live_metrics' in info) {
                        // Caso: Es un objeto HealthStatus completo
                        parsedHealth = {
                            ...info,
                            live_metrics: typeof info.live_metrics === 'string' 
                                ? parseLiveMetricsString(info.live_metrics)
                                : info.live_metrics
                        };
                    } else if ('cpu' in info || 'ram' in info) {
                        // Caso: El objeto es directamente las métricas
                        parsedHealth = {
                            status: 'healthy',
                            last_check: info.last_update || info.timestamp || new Date().toISOString(),
                            is_stale: false,
                            live_metrics: info
                        };
                    }
                }

                if (parsedHealth) {
                    mappedMetrics[serverId] = parsedHealth;
                }
            });
            
            // console.log('[MonitoringStore] Mapped Metrics:', mappedMetrics);
            set({ liveMetrics: mappedMetrics });
        } catch (err: any) {
            console.error('[MonitoringStore] Error fetching live cache:', err);
        }
    },

    fetchDBGlobalSummary: async () => {
        set((state) => ({ databaseMetrics: { ...state.databaseMetrics, isLoading: true, error: null } }));
        try {
            const summary = await databaseService.getGlobalSummary();
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    summary,
                    isLoading: false
                }
            }));
        } catch (err: any) {
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    error: err.message || 'Error al obtener el resumen global de BD',
                    isLoading: false
                }
            }));
        }
    },

    fetchDBLiveCache: async () => {
        set((state) => ({ databaseMetrics: { ...state.databaseMetrics, isLoading: true, error: null } }));
        try {
            const instances = await databaseService.getLiveCacheInstances();
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    instances,
                    isLoading: false
                }
            }));
        } catch (err: any) {
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    error: err.message || 'Error al obtener la caché en vivo de BD',
                    isLoading: false
                }
            }));
        }
    },

    triggerDBDiscoverAll: async () => {
        set((state) => ({ databaseMetrics: { ...state.databaseMetrics, isLoading: true, error: null } }));
        try {
            const response = await databaseService.triggerDiscoverAll();
            // Refrescar inmediatamente
            const summary = await databaseService.getGlobalSummary();
            const instances = await databaseService.getLiveCacheInstances();
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    summary,
                    instances,
                    isLoading: false
                }
            }));
            return response;
        } catch (err: any) {
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    error: err.message || 'Error durante el auto-descubrimiento de BD',
                    isLoading: false
                }
            }));
            throw err;
        }
    },

    refreshDBInstanceMetrics: async (instanciaId: number) => {
        set((state) => ({ databaseMetrics: { ...state.databaseMetrics, isLoading: true, error: null } }));
        try {
            const updatedInstance = await databaseService.refreshInstanceMetrics(instanciaId);
            set((state) => {
                const instances = state.databaseMetrics.instances.map(inst =>
                    inst.instancia_id === instanciaId ? updatedInstance : inst
                );
                return {
                    databaseMetrics: {
                        ...state.databaseMetrics,
                        instances,
                        isLoading: false
                    }
                };
            });
        } catch (err: any) {
            set((state) => ({
                databaseMetrics: {
                    ...state.databaseMetrics,
                    error: err.message || `Error al refrescar la instancia ${instanciaId}`,
                    isLoading: false
                }
            }));
        }
    }
}));

// Función auxiliar para parsear el string de métricas: cpu|ram|disks|uptime|timestamp
function parseLiveMetricsString(metricsStr: string) {
    const [cpu, ram, disksRaw, uptime, timestamp] = metricsStr.split('|');
    
    const disks: Record<string, number> = {};
    if (disksRaw) {
        disksRaw.split(',').forEach(d => {
            const [mount, usage] = d.split(':');
            if (mount && usage) disks[mount] = parseFloat(usage);
        });
    }

    return {
        cpu: parseFloat(cpu) || 0,
        ram: parseFloat(ram) || 0,
        disks,
        uptime: parseFloat(uptime) || 0,
        timestamp: parseInt(timestamp) || 0
    };
}
