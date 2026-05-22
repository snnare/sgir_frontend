import { useEffect, useState, useCallback } from 'react';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { type DBDiscoveryResponse } from '../api/types';

/**
 * Hook para el Resumen Global de Bases de Datos (global-summary).
 * Implementa polling inteligente cada 30 segundos.
 */
export const useDBGlobalSummary = () => {
    const { databaseMetrics, fetchDBGlobalSummary } = useMonitoringStore();

    useEffect(() => {
        // Carga inicial
        fetchDBGlobalSummary();

        // Polling cada 30 segundos
        const interval = setInterval(() => {
            fetchDBGlobalSummary();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchDBGlobalSummary]);

    return {
        data: databaseMetrics.summary,
        isLoading: databaseMetrics.isLoading && !databaseMetrics.summary,
        isFetching: databaseMetrics.isLoading,
        error: databaseMetrics.error,
    };
};

/**
 * Hook para el Detalle de Instancias en Tiempo Real (live-cache).
 * Implementa polling inteligente cada 60 segundos.
 */
export const useDBLiveCache = () => {
    const { databaseMetrics, fetchDBLiveCache } = useMonitoringStore();

    useEffect(() => {
        // Carga inicial
        fetchDBLiveCache();

        // Polling cada 60 segundos
        const interval = setInterval(() => {
            fetchDBLiveCache();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchDBLiveCache]);

    return {
        data: databaseMetrics.instances,
        isLoading: databaseMetrics.isLoading && databaseMetrics.instances.length === 0,
        isFetching: databaseMetrics.isLoading,
        error: databaseMetrics.error,
    };
};

/**
 * Hook para disparar la mutación de descubrimiento masivo de bases de datos.
 * Limpia e invalida las cachés locales al completarse con éxito.
 */
export const useTriggerDBDiscoverAll = () => {
    const { triggerDBDiscoverAll } = useMonitoringStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DBDiscoveryResponse | null>(null);

    const mutate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await triggerDBDiscoverAll();
            setData(result);
            return result;
        } catch (err: any) {
            const errMsg = err.message || 'Error al disparar el auto-descubrimiento';
            setError(errMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [triggerDBDiscoverAll]);

    return {
        mutate,
        isLoading,
        error,
        data,
        isSuccess: !!data && !error && !isLoading,
    };
};
