import api from './client';
import { z } from 'zod';
import { 
    DBGlobalSummarySchema, type DBGlobalSummary,
    DBInstanceHealthSchema, type DBInstanceHealth,
    DBDiscoveryResponseSchema, type DBDiscoveryResponse
} from './types';

export const databaseService = {
    /**
     * 1. Recupera el resumen consolidado en tiempo real desde la caché (Live Cache)
     * Altamente optimizado para barras de estado generales y dashboards principales.
     */
    async getGlobalSummary(): Promise<DBGlobalSummary> {
        const { data } = await api.get('/sgir/v1/m2/inventory/global-summary');
        return DBGlobalSummarySchema.parse(data);
    },

    /**
     * 2. Recupera la lista de todas las instancias de base de datos activas y sus métricas
     * desde la caché global en memoria.
     */
    async getLiveCacheInstances(): Promise<DBInstanceHealth[]> {
        const { data } = await api.get('/sgir/v1/m2/inventory/live-cache');
        return z.array(DBInstanceHealthSchema).parse(data);
    },

    /**
     * 3. Dispara un escaneo masivo (Auto-descubrimiento y recolección concurrente) en el backend.
     */
    async triggerDiscoverAll(): Promise<DBDiscoveryResponse> {
        const { data } = await api.post('/sgir/v1/m2/inventory/discover-all');
        return DBDiscoveryResponseSchema.parse(data);
    },

    /**
     * 4. Forzar la recolección manual/ad-hoc de métricas para una instancia específica.
     */
    async refreshInstanceMetrics(instanciaId: number): Promise<DBInstanceHealth> {
        const { data } = await api.post(`/sgir/v1/m2/inventory/instance/${instanciaId}/refresh`);
        return DBInstanceHealthSchema.parse(data);
    }
};
