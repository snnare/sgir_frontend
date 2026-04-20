import api from './client';
import { 
    ServerSchema, type Server, ServerCreateSchema, type ServerCreateInput,
    ServerCheckResponseSchema, type ServerCheckResponse,
    InstanceSchema, type Instance, 
    DbmsSchema, type Dbms, 
    CredentialSchema, type Credential, 
    CredentialEnrichedSchema, type CredentialEnriched,
    CredentialCreateSchema, type CredentialCreateInput,
    CredentialUpdateSchema, type CredentialUpdateInput,
    CriticalitySchema, type Criticality,
    GeneralStatusSchema, type GeneralStatus
} from './types';
import { z } from 'zod';

export const getServers = async (): Promise<Server[]> => {
    const { data } = await api.get('/servidores/');
    return z.array(ServerSchema).parse(data);
};

export const createServer = async (serverData: ServerCreateInput): Promise<Server> => {
    const { data } = await api.post('/servidores/', serverData);
    return ServerSchema.parse(data);
};

export const getServerById = async (id: number): Promise<Server> => {
    const { data } = await api.get(`/servidores/${id}`);
    return ServerSchema.parse(data);
};

export const checkServerByIp = async (ip: string): Promise<ServerCheckResponse> => {
    const { data } = await api.get(`/servidores/${ip}`);
    return ServerCheckResponseSchema.parse(data);
};

export const getInstancesByServer = async (serverId: number): Promise<Instance[]> => {
    const { data } = await api.get(`/instancias/servidor/${serverId}`);
    return z.array(InstanceSchema).parse(data);
};

export const getDbms = async (): Promise<Dbms[]> => {
    const { data } = await api.get('/dbms/');
    return z.array(DbmsSchema).parse(data);
};

export const createCredential = async (credentialData: CredentialCreateInput): Promise<Credential> => {
    const { data } = await api.post('/credenciales/', credentialData);
    return CredentialSchema.parse(data);
};

export const getCredentials = async (): Promise<CredentialEnriched[]> => {
    const { data } = await api.get('/credenciales/');
    return z.array(CredentialEnrichedSchema).parse(data);
};

export const getCredentialById = async (id: number): Promise<Credential> => {
    const { data } = await api.get(`/credenciales/${id}`);
    return CredentialSchema.parse(data);
};

export const updateCredential = async (id: number, credentialData: CredentialUpdateInput): Promise<Credential> => {
    const { data } = await api.put(`/credenciales/${id}`, credentialData);
    return CredentialSchema.parse(data);
};

export const deleteCredential = async (id: number): Promise<void> => {
    await api.delete(`/credenciales/${id}`);
};

export const getCredentialsByServer = async (serverId: number): Promise<Credential[]> => {
    const { data } = await api.get(`/credenciales/servidor/${serverId}`);
    return z.array(CredentialSchema).parse(data);
};

export const getCriticalities = async (): Promise<Criticality[]> => {
    const { data } = await api.get('/criticidad/');
    return z.array(CriticalitySchema).parse(data);
};

export const getGeneralStatuses = async (): Promise<GeneralStatus[]> => {
    const { data } = await api.get('/estados/');
    return z.array(GeneralStatusSchema).parse(data);
};