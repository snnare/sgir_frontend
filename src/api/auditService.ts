import api from './client';
import { 
    AuditLogSchema, type AuditLog, 
    AuditEventTypeSchema, type AuditEventType 
} from './types';
import { z } from 'zod';

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const { data } = await api.get('/audit-logs/');
    return z.array(AuditLogSchema).parse(data);
};

export const getAuditEventTypes = async (): Promise<AuditEventType[]> => {
    const { data } = await api.get('/audit-types/');
    return z.array(AuditEventTypeSchema).parse(data);
};
