import api from './client';
import { 
    AlertSchema, type Alert, 
    AlertLevelSchema, type AlertLevel, 
    MonitoringSummarySchema, type MonitoringSummary, 
    HostMetricsSchema, type HostMetrics, 
    MySQLMetricsSchema, type MySQLMetrics, 
    MongoDBMetricsSchema, type MongoDBMetrics,
    SchedulerStatusSchema, type SchedulerStatus,
    HealthStatusSchema, type HealthStatus,
    GlobalSummarySchema, type GlobalSummary,
    BackupDiscoveryResponseSchema, type BackupDiscoveryResponse,
    ServerBackupDiscoveryResponseSchema, type ServerBackupDiscoveryResponse,
    MonitoringSessionSchema, type MonitoringSession,
    MonitoringSessionDetailSchema, type MonitoringSessionDetail,
    type MonitoringCreateInput, type ParsedDBLiveMetrics,
    GlobalBackupDiscoveryResponseSchema, type GlobalBackupDiscoveryResponse
} from './types';
import { z } from 'zod';

export const getAlerts = async (): Promise<Alert[]> => {
    const { data } = await api.get('/crud/alertas/active');
    return z.array(AlertSchema).parse(data);
};

export const getAlertsToday = async (): Promise<Alert[]> => {
    const { data } = await api.get('/crud/alertas/today');
    return z.array(AlertSchema).parse(data);
};

export const getAlertsRecent = async (limit: number = 50): Promise<Alert[]> => {
    const { data } = await api.get('/crud/alertas/recent', { params: { limit } });
    return z.array(AlertSchema).parse(data);
};

export const getAlertsByServer = async (serverId: number): Promise<Alert[]> => {
    const { data } = await api.get(`/crud/alertas/servidor/${serverId}`);
    return z.array(AlertSchema).parse(data);
};

export const getMonitoringStatus = async (id: number): Promise<MonitoringSessionDetail> => {
    const { data } = await api.get(`/crud/monitoreo/${id}`);
    return MonitoringSessionDetailSchema.parse(data);
};

export const getMonitoringSessions = async (): Promise<MonitoringSession[]> => {
    const { data } = await api.get('/crud/monitoreo/');
    return z.array(MonitoringSessionSchema).parse(data);
};

export const createMonitoringSession = async (monitoringData: MonitoringCreateInput): Promise<MonitoringSession> => {
    const { data } = await api.post('/crud/monitoreo/', monitoringData);
    return MonitoringSessionSchema.parse(data);
};

export const getAlertLevels = async (): Promise<AlertLevel[]> => {
    const { data } = await api.get('/crud/nivel-alerta/');
    return z.array(AlertLevelSchema).parse(data);
};

export const getMonitoringSummary = async (serverId: number): Promise<MonitoringSummary> => {
    const { data } = await api.get(`/m2/inventory/summary/${serverId}`);
    return MonitoringSummarySchema.parse(data);
};

export const getHostMetrics = async (serverId: number, credId: number): Promise<HostMetrics> => {
    const { data } = await api.get(`/m1/host/${serverId}/${credId}`);
    return HostMetricsSchema.parse(data);
};

// --- Control del Scheduler ---

export const getSchedulerStatus = async (): Promise<SchedulerStatus> => {
    const { data } = await api.get('/m1/host/scheduler/status');
    return SchedulerStatusSchema.parse(data);
};

export const pauseScheduler = async (): Promise<SchedulerStatus> => {
    const { data } = await api.post('/m1/host/scheduler/pause');
    return SchedulerStatusSchema.parse(data);
};

export const resumeScheduler = async (): Promise<SchedulerStatus> => {
    const { data } = await api.post('/m1/host/scheduler/resume');
    return SchedulerStatusSchema.parse(data);
};

// --- Métricas en Tiempo Real (Live Cache) ---

export const getGlobalSummary = async (): Promise<GlobalSummary> => {
    const { data } = await api.get('/m1/host/global-summary');
    return GlobalSummarySchema.parse(data);
};

export const getHealthStatus = async (serverId: number): Promise<HealthStatus> => {
    const { data } = await api.get(`/m1/host/health-status/${serverId}`);
    return HealthStatusSchema.parse(data);
};

export const getLiveCache = async (): Promise<Record<number, HealthStatus>> => {
    const { data } = await api.get('/m1/host/live-cache');
    return data;
};

export const getMySQLMetrics = async (serverId: number, credId: number): Promise<MySQLMetrics> => {
    const { data } = await api.get(`/m1/mysql8/${serverId}/${credId}`);
    return MySQLMetricsSchema.parse(data);
};

export const getMongoDBMetrics = async (serverId: number, credId: number): Promise<MongoDBMetrics> => {
    const { data } = await api.get(`/m1/mongodb/${serverId}/${credId}`);
    return MongoDBMetricsSchema.parse(data);
};

export const discoverBackups = async (serverId: number, credId: number, pathId: number): Promise<ServerBackupDiscoveryResponse> => {
    const { data } = await api.post(`/m3/inventory/discover-backups-server/${serverId}/${credId}/${pathId}`);
    return ServerBackupDiscoveryResponseSchema.parse(data);
};

export const discoverInstanceBackups = async (instanceId: number, credId: number, pathId: number): Promise<BackupDiscoveryResponse> => {
    const { data } = await api.post(`/m3/inventory/discover-backups/${instanceId}/${credId}/${pathId}`);
    return BackupDiscoveryResponseSchema.parse(data);
};

export const discoverAllBackups = async (): Promise<GlobalBackupDiscoveryResponse> => {
    const { data } = await api.post('/m3/inventory/discover-all-backups');
    return GlobalBackupDiscoveryResponseSchema.parse(data);
};

export const getDBLiveCache = async (): Promise<Record<number, string | ParsedDBLiveMetrics>> => {
    const { data } = await api.get('/m1/db/live-cache');
    return data;
};

