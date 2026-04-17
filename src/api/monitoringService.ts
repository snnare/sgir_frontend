import api from './client';
import { 
    AlertSchema, type Alert, 
    AlertLevelSchema, type AlertLevel, 
    MonitoringSummarySchema, type MonitoringSummary, 
    HostMetricsSchema, type HostMetrics, 
    MySQLMetricsSchema, type MySQLMetrics, 
    MongoDBMetricsSchema, type MongoDBMetrics 
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

export const getMySQLMetrics = async (serverId: number, credId: number): Promise<MySQLMetrics> => {
    const { data } = await api.get(`/monitoring/mysql8/${serverId}/${credId}`);
    return MySQLMetricsSchema.parse(data);
};

export const getMongoDBMetrics = async (serverId: number, credId: number): Promise<MongoDBMetrics> => {
    const { data } = await api.get(`/monitoring/mongodb/${serverId}/${credId}`);
    return MongoDBMetricsSchema.parse(data);
};
