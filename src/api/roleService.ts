import api from './client';
import { RoleSchema, type Role } from './types';
import { z } from 'zod';

export const getRoles = async (): Promise<Role[]> => {
    const { data } = await api.get('/roles/');
    return z.array(RoleSchema).parse(data);
};

export const getRoleById = async (id: number): Promise<Role> => {
    const { data } = await api.get(`/roles/${id}`);
    return RoleSchema.parse(data);
};
