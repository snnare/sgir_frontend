import {z} from 'zod'

export interface PingResponse { 
    status: string;
    message?: string;
    timestamp?: string
}

// Esquema para el formulario de Login (Frontend)
export const LoginSchema = z.object({
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
    password: z.string().min(6, 'La password debe tener al menos 6 caracteres')
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Esquema para el formulario de Registro (UserCreate)
export const RegisterSchema = z.object({
    nombres: z.string().min(1, 'Los nombres son requeridos'),
    apellidos: z.string().min(1, 'Los apellidos son requeridos'),
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    id_rol: z.number().optional().default(2),
    id_estado_usuario: z.number().optional().default(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Esquema para la respuesta de Login
export const LoginResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Esquema para la respuesta de Usuario (UserResponse)
export const UserResponseSchema = z.object({
    id_usuario: z.number(),
    email: z.string().email(),
    nombres: z.string(),
    apellidos: z.string(),
    id_rol: z.number(),
    creado_en: z.string().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Esquema para actualización de Usuario (UserUpdate)
export const UserUpdateSchema = z.object({
    nombres: z.string().min(1, 'Los nombres son requeridos'),
    apellidos: z.string().min(1, 'Los apellidos son requeridos'),
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;