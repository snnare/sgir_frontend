import api from './client';
import { 
    BackupPolicySchema, type BackupPolicy, 
    BackupPolicyCreateSchema, type BackupPolicyCreateInput,
    BackupPathSchema, type BackupPath, 
    BackupPathCreateSchema, type BackupPathCreateInput,
    BackupHistorySchema, type BackupHistory 
} from './types';
import { z } from 'zod';

export const getBackupPolicies = async (): Promise<BackupPolicy[]> => {
    const { data } = await api.get('/politicas-respaldo/');
    return z.array(BackupPolicySchema).parse(data);
};

export const createBackupPolicy = async (policyData: BackupPolicyCreateInput): Promise<BackupPolicy> => {
    const { data } = await api.post('/politicas-respaldo/', policyData);
    return BackupPolicySchema.parse(data);
};

export const updateBackupPolicy = async (id: number, policyData: Partial<BackupPolicyCreateInput>): Promise<BackupPolicy> => {
    const { data } = await api.put(`/politicas-respaldo/${id}`, policyData);
    return BackupPolicySchema.parse(data);
};

export const deleteBackupPolicy = async (id: number): Promise<void> => {
    await api.delete(`/politicas-respaldo/${id}`);
};

export const getBackupPaths = async (): Promise<BackupPath[]> => {
    const { data } = await api.get('/rutas-respaldo/');
    return z.array(BackupPathSchema).parse(data);
};

export const createBackupPath = async (pathData: BackupPathCreateInput): Promise<BackupPath> => {
    const { data } = await api.post('/rutas-respaldo/', pathData);
    return BackupPathSchema.parse(data);
};

export const updateBackupPath = async (id: number, pathData: BackupPathCreateInput): Promise<BackupPath> => {
    const { data } = await api.put(`/rutas-respaldo/${id}`, pathData);
    return BackupPathSchema.parse(data);
};

export const deleteBackupPath = async (id: number): Promise<void> => {
    await api.delete(`/rutas-respaldo/${id}`);
};

export const getBackupHistory = async (): Promise<BackupHistory[]> => {
    const { data } = await api.get('/respaldos/historial');
    return z.array(BackupHistorySchema).parse(data);
};
