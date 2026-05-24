import api from './client';
import { 
    ServerSchema, type Server, type ServerCreateInput,
    type ServerUpdateInput,
    InstanceSchema, type Instance, 
    DbmsSchema, type Dbms, 
    CredentialSchema, type Credential, 
    CredentialEnrichedSchema, type CredentialEnriched,
    type CredentialCreateInput,
    type CredentialUpdateInput,
    CriticalitySchema, type Criticality,
    GeneralStatusSchema, type GeneralStatus,
    ImportSummarySchema, type ImportSummary,
    AssetSchema, type Asset,
    DiscoveryResponseSchema, type DiscoveryResponse,
    GlobalDiscoveryResponseSchema, type GlobalDiscoveryResponse,
    FilesystemDiscoveryResponseSchema, type FilesystemDiscoveryResponse,
    type PartitionUpsertInput
} from './types';
import { z } from 'zod';

export const getServers = async (): Promise<Server[]> => {
    const { data } = await api.get('/crud/servidores/');
    return z.array(ServerSchema).parse(data);
};

export const createServer = async (serverData: ServerCreateInput): Promise<Server> => {
    const { data } = await api.post('/crud/servidores/', serverData);
    return ServerSchema.parse(data);
};

export const getServerById = async (id: number): Promise<Server> => {
    const { data } = await api.get(`/crud/servidores/${id}`);
    return ServerSchema.parse(data);
};

export const updateServer = async (id: number, serverData: ServerUpdateInput): Promise<Server> => {
    const { data } = await api.put(`/crud/servidores/${id}`, serverData);
    return ServerSchema.parse(data);
};

export const deleteServer = async (id: number): Promise<void> => {
    await api.delete(`/crud/servidores/${id}`);
};

export const checkServerByIp = async (ip: string): Promise<any> => {
    const { data } = await api.get(`/crud/servidores/ip/${ip}`, {
        validateStatus: (status) => status === 200 || status === 404
    });
    return data;
};

export const pingServer = async (ip: string): Promise<boolean> => {
    const { data } = await api.get(`/crud/servidores/ping/${ip}`);
    return data as boolean;
};

export const getInstancesByServer = async (serverId: number): Promise<Instance[]> => {
    const { data } = await api.get(`/crud/instancias/servidor/${serverId}`);
    return z.array(InstanceSchema).parse(data);
};

export const createInstance = async (instanceData: any): Promise<Instance> => {
    const { data } = await api.post('/crud/instancias/', instanceData);
    return InstanceSchema.parse(data);
};

export const getDbms = async (): Promise<Dbms[]> => {
    const { data } = await api.get('/crud/dbms/');
    return z.array(DbmsSchema).parse(data);
};

export const createCredential = async (credentialData: CredentialCreateInput): Promise<Credential> => {
    const { data } = await api.post('/crud/credenciales/', credentialData);
    return CredentialSchema.parse(data);
};

export const getCredentials = async (): Promise<CredentialEnriched[]> => {
    const { data } = await api.get('/crud/credenciales/');
    return z.array(CredentialEnrichedSchema).parse(data);
};

export const getCredentialById = async (id: number): Promise<Credential> => {
    const { data } = await api.get(`/crud/credenciales/${id}`);
    return CredentialSchema.parse(data);
};

export const updateCredential = async (id: number, credentialData: CredentialUpdateInput): Promise<Credential> => {
    const { data } = await api.put(`/crud/credenciales/${id}`, credentialData);
    return CredentialSchema.parse(data);
};

export const deleteCredential = async (id: number): Promise<void> => {
    await api.delete(`/crud/credenciales/${id}`);
};

export const getCredentialsByServer = async (serverId: number): Promise<CredentialEnriched[]> => {
    const { data } = await api.get(`/crud/credenciales/servidor/${serverId}`);
    return z.array(CredentialEnrichedSchema).parse(data);
};

export const getCriticalities = async (): Promise<Criticality[]> => {
    const { data } = await api.get('/crud/criticidad/');
    return z.array(CriticalitySchema).parse(data);
};

export const getGeneralStatuses = async (): Promise<GeneralStatus[]> => {
    const { data } = await api.get('/crud/estados/');
    return z.array(GeneralStatusSchema).parse(data);
};

// --- Tests de Conexión ---

export interface ConnectionTestRequest {
    direccion_ip: string;
    puerto?: number;
    usuario: string;
    password?: string;
}

export interface ConnectionTestResponse {
    status: string;
    message: string;
    details?: any;
}

export const testConnectionDb = async (motorPath: string, testData: ConnectionTestRequest): Promise<ConnectionTestResponse> => {
    const { data } = await api.post(`/crud/conexion/test/db/${motorPath}`, testData);
    return data;
};

export const testConnectionSsh = async (testData: ConnectionTestRequest): Promise<ConnectionTestResponse> => {
    const { data } = await api.post('/crud/conexion/test/ssh', testData);
    return data;
};

export const importBulkServers = async (file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/crud/servidores/import-bulk', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return ImportSummarySchema.parse(data);
};

export const getAssets = async (): Promise<Asset[]> => {
    const { data } = await api.get('/m2/inventory/assets');
    return z.array(AssetSchema).parse(data);
};

export const discoverInventory = async (instanceId: number, credentialId: number): Promise<DiscoveryResponse> => {
    const { data } = await api.post(`/m2/inventory/discover/${instanceId}/${credentialId}`);
    return DiscoveryResponseSchema.parse(data);
};

export const discoverAllInventory = async (): Promise<GlobalDiscoveryResponse> => {
    const { data } = await api.post('/m2/inventory/discover-all');
    return GlobalDiscoveryResponseSchema.parse(data);
};

export const discoverFilesystems = async (serverId: number): Promise<FilesystemDiscoveryResponse> => {
    const { data } = await api.post(`/m1/host/discover-filesystems/${serverId}`, {});
    return FilesystemDiscoveryResponseSchema.parse(data);
};

export const upsertPartition = async (partitionData: PartitionUpsertInput): Promise<any> => {
    const { data } = await api.post('/crud/particiones/register-upsert', partitionData);
    return data;
};
