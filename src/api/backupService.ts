import api from './client';
import { 
    BackupPolicySchema, type BackupPolicy, 
    BackupPathSchema, type BackupPath, 
    BackupHistorySchema, type BackupHistory 
} from './types';
import { z } from 'zod';

export const getBackupPolicies = async (): Promise<BackupPolicy[]> => {
    const { data } = await api.get('/politicas-respaldo/');
    return z.array(BackupPolicySchema).parse(data);
};

export const getBackupPaths = async (): Promise<BackupPath[]> => {
    const { data } = await api.get('/rutas-respaldo/');
    return z.array(BackupPathSchema).parse(data);
};

export const getBackupHistory = async (): Promise<BackupHistory[]> => {
    const { data } = await api.get('/respaldos/historial');
    return z.array(BackupHistorySchema).parse(data);
};
