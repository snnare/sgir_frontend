import api from './client';
import { z } from 'zod';

// Definimos el esquema de respuesta según lo que devuelve FastAPI
export const HealthResponseSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const getHealthStatus = async (): Promise<HealthResponse> => {
  const { data } = await api.get('/ping');
  return HealthResponseSchema.parse(data);
};