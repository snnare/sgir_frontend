import {z} from 'zod'

export interface PingResponse { 
    status: string;
    message?: string;
    timestamp?: string
}



export const LoginSchema = z.object({
    username: z.string().min(1, 'El usuario es requerido'),
    password: z.string().min(6, 'La password debe tener al menos 6 caracteres')
});

export type LoginInput = z.infer<typeof LoginSchema>;