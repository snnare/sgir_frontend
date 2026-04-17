import api from './client';
import { 
    ServerSchema, type Server, 
    InstanceSchema, type Instance, 
    DbmsSchema, type Dbms, 
    CredentialSchema, type Credential, 
    CriticalitySchema, type Criticality 
} from './types';
import { z } from 'zod';

export const getServers = async (): Promise<Server[]> => {
    const { data } = await api.get('/servidores/');
    return z.array(ServerSchema).parse(data);
};

export const getServerById = async (id: number): Promise<Server> => {
    const { data } = await api.get(`/servidores/${id}`);
    return ServerSchema.parse(data);
};

export const getInstancesByServer = async (serverId: number): Promise<Instance[]> => {
    const { data } = await api.get(`/instancias/servidor/${serverId}`);
    return z.array(InstanceSchema).parse(data);
};

export const getDbms = async (): Promise<Dbms[]> => {
    const { data } = await api.get('/dbms/');
    return z.array(DbmsSchema).parse(data);
};

export const getCredentialsByServer = async (serverId: number): Promise<Credential[]> => {
    const { data } = await api.get(`/credenciales/servidor/${serverId}`);
    return z.array(CredentialSchema).parse(data);
};

export const getCriticalities = async (): Promise<Criticality[]> => {
    const { data } = await api.get('/criticidad/');
    return z.array(CriticalitySchema).parse(data);
};
