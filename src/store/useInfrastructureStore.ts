import { create } from 'zustand';
import { 
    getServers, getServerById, getInstancesByServer, 
    getDbms, getCredentialsByServer, getCriticalities 
} from '../api/infrastructureService';
import type { Server, Instance, Dbms, Credential, Criticality } from '../api/types';

interface InfrastructureState {
    servers: Server[];
    currentServer: Server | null;
    instances: Instance[];
    dbmsList: Dbms[];
    credentials: Credential[];
    criticalities: Criticality[];
    loading: boolean;
    error: string | null;

    fetchServers: () => Promise<void>;
    fetchServerById: (id: number) => Promise<void>;
    fetchInstancesByServer: (serverId: number) => Promise<void>;
    fetchDbmsList: () => Promise<void>;
    fetchCredentialsByServer: (serverId: number) => Promise<void>;
    fetchCriticalities: () => Promise<void>;
}

export const useInfrastructureStore = create<InfrastructureState>((set) => ({
    servers: [],
    currentServer: null,
    instances: [],
    dbmsList: [],
    credentials: [],
    criticalities: [],
    loading: false,
    error: null,

    fetchServers: async () => {
        set({ loading: true, error: null });
        try {
            const servers = await getServers();
            set({ servers, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchServerById: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const server = await getServerById(id);
            set({ currentServer: server, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchInstancesByServer: async (serverId: number) => {
        set({ loading: true, error: null });
        try {
            const instances = await getInstancesByServer(serverId);
            set({ instances, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchDbmsList: async () => {
        set({ loading: true, error: null });
        try {
            const dbmsList = await getDbms();
            set({ dbmsList, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchCredentialsByServer: async (serverId: number) => {
        set({ loading: true, error: null });
        try {
            const credentials = await getCredentialsByServer(serverId);
            set({ credentials, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchCriticalities: async () => {
        set({ loading: true, error: null });
        try {
            const criticalities = await getCriticalities();
            set({ criticalities, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
}));
