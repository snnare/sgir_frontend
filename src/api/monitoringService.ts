import api from './client';
import { 
    AlertSchema, type Alert, 
    AlertLevelSchema, type AlertLevel, 
    MonitoringSummarySchema, type MonitoringSummary, 
    HostMetricsSchema, type HostMetrics, 
    MySQLMetricsSchema, type MySQLMetrics, 
    MongoDBMetricsSchema, type MongoDBMetrics,
    SchedulerStatusSchema, type SchedulerStatus,
    LiveMetricsSchema, type LiveMetrics,
    GlobalSummarySchema, type GlobalSummary,
    BackupDiscoveryResponseSchema, type BackupDiscoveryResponse
} from './types';
import { z } from 'zod';

export const getAlertsByServer = async (serverId: number): Promise<Alert[]> => {
    const { data } = await api.get(`/alertas/servidor/${serverId}`);
    return z.array(AlertSchema).parse(data);
};

export const getMonitoringStatus = async (id: number): Promise<any> => {
    const { data } = await api.get(`/monitoreo/${id}`);
    return data;
};

export const getAlertLevels = async (): Promise<AlertLevel[]> => {
    const { data } = await api.get('/nivel-alerta/');
    return z.array(AlertLevelSchema).parse(data);
};

export const getMonitoringSummary = async (serverId: number): Promise<MonitoringSummary> => {
    const { data } = await api.get(`/monitoring/inventory/summary/${serverId}`);
    return MonitoringSummarySchema.parse(data);
};

export const getHostMetrics = async (serverId: number, credId: number): Promise<HostMetrics> => {
    const { data } = await api.get(`/monitoring/host/${serverId}/${credId}`);
    return HostMetricsSchema.parse(data);
};

// --- Control del Scheduler ---

export const getSchedulerStatus = async (): Promise<SchedulerStatus> => {
    const { data } = await api.get('/monitoring/host/scheduler/status');
    return SchedulerStatusSchema.parse(data);
};

export const pauseScheduler = async (): Promise<SchedulerStatus> => {
    const { data } = await api.post('/monitoring/host/scheduler/pause');
    return SchedulerStatusSchema.parse(data);
};

export const resumeScheduler = async (): Promise<SchedulerStatus> => {
    const { data } = await api.post('/monitoring/host/scheduler/resume');
    return SchedulerStatusSchema.parse(data);
};

// --- Métricas en Tiempo Real (Live Cache) ---

export const getGlobalSummary = async (): Promise<GlobalSummary> => {
    const { data } = await api.get('/monitoring/host/global-summary');
    return GlobalSummarySchema.parse(data);
};

export const getLiveMetrics = async (serverId: number): Promise<LiveMetrics> => {
    const { data } = await api.get(`/monitoring/host/health-status/${serverId}`);
    return LiveMetricsSchema.parse(data);
};

export const getMySQLMetrics = async (serverId: number, credId: number): Promise<MySQLMetrics> => {
    const { data } = await api.get(`/monitoring/mysql8/${serverId}/${credId}`);
    return MySQLMetricsSchema.parse(data);
};

export const getMongoDBMetrics = async (serverId: number, credId: number): Promise<MongoDBMetrics> => {
    const { data } = await api.get(`/monitoring/mongodb/${serverId}/${credId}`);
    return MongoDBMetricsSchema.parse(data);
};

export const discoverBackups = async (serverId: number, credId: number, pathId: number): Promise<BackupDiscoveryResponse> => {
    const { data } = await api.post(`/monitoring/inventory/discover-backups-server/${serverId}/${credId}/${pathId}`);
    return BackupDiscoveryResponseSchema.parse(data);
};
