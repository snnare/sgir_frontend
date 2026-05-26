import api from './client';
import { 
    BackupPolicySchema, type BackupPolicy, 
    type BackupPolicyCreateInput,
    BackupPathSchema, type BackupPath, 
    type BackupPathCreateInput,
    BackupHistorySchema, type BackupHistory,
    type BackupHistoryCreateInput,
    PolicyAssetResponseSchema, type PolicyAssetResponse
} from './types';
import { z } from 'zod';

export const getBackupPolicies = async (): Promise<BackupPolicy[]> => {
    const { data } = await api.get('/crud/politicas-respaldo/');
    return z.array(BackupPolicySchema).parse(data);
};

export const createBackupPolicy = async (policyData: BackupPolicyCreateInput): Promise<BackupPolicy> => {
    const { data } = await api.post('/crud/politicas-respaldo/', policyData);
    return BackupPolicySchema.parse(data);
};

export const updateBackupPolicy = async (id: number, policyData: Partial<BackupPolicyCreateInput>): Promise<BackupPolicy> => {
    const { data } = await api.put(`/crud/politicas-respaldo/${id}`, policyData);
    return BackupPolicySchema.parse(data);
};

export const deleteBackupPolicy = async (id: number): Promise<void> => {
    await api.delete(`/crud/politicas-respaldo/${id}`);
};

export const getPolicyAssets = async (id: number): Promise<PolicyAssetResponse> => {
    const { data } = await api.get(`/crud/politicas-respaldo/${id}/assets`);
    return PolicyAssetResponseSchema.parse(data);
};

export const getBackupPaths = async (): Promise<BackupPath[]> => {
    const { data } = await api.get('/crud/rutas-respaldo/');
    return z.array(BackupPathSchema).parse(data);
};

export const getBackupPathsByServer = async (serverId: number): Promise<BackupPath[]> => {
    const { data } = await api.get(`/crud/rutas-respaldo/servidor/${serverId}`);
    return z.array(BackupPathSchema).parse(data);
};

export const createBackupPath = async (pathData: BackupPathCreateInput): Promise<BackupPath> => {
    const { data } = await api.post('/crud/rutas-respaldo/', pathData);
    return BackupPathSchema.parse(data);
};

export const updateBackupPath = async (id: number, pathData: BackupPathCreateInput): Promise<BackupPath> => {
    const { data } = await api.put(`/crud/rutas-respaldo/${id}`, pathData);
    return BackupPathSchema.parse(data);
};

export const deleteBackupPath = async (id: number): Promise<void> => {
    await api.delete(`/crud/rutas-respaldo/${id}`);
};

export const getBackupHistory = async (): Promise<BackupHistory[]> => {
    const { data } = await api.get('/crud/respaldos/historial');
    return z.array(BackupHistorySchema).parse(data);
};

export const createBackup = async (backupData: BackupHistoryCreateInput): Promise<BackupHistory> => {
    const { data } = await api.post('/crud/respaldos/', backupData);
    return BackupHistorySchema.parse(data);
};
