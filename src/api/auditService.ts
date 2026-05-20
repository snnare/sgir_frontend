import api from './client';
import { 
    AuditLogSchema, type AuditLog, 
    AuditEventTypeSchema, type AuditEventType 
} from './types';
import { z } from 'zod';

export const getAuditLogs = async (skip: number = 0, limit: number = 100): Promise<AuditLog[]> => {
    const { data } = await api.get('/crud/audit-logs/', { params: { skip, limit } });
    return z.array(AuditLogSchema).parse(data);
};

export const getAuditEventTypes = async (): Promise<AuditEventType[]> => {
    const { data } = await api.get('/crud/audit-types/');
    return z.array(AuditEventTypeSchema).parse(data);
};
