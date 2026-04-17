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

// Esquema para Roles
export const RoleSchema = z.object({
    id_rol: z.number(),
    nombre_rol: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;

// --- Infraestructura ---
export const ServerCreateSchema = z.object({
    nombre_servidor: z.string().min(1, 'El nombre es requerido'),
    direccion_ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP v4 inválida'),
    descripcion: z.string().optional(),
    id_tipo_acceso: z.number().int().positive(),
    id_nivel_criticidad: z.number().int().positive(),
    id_estado: z.number().int().positive(),
});

export type ServerCreateInput = z.infer<typeof ServerCreateSchema>;

export const ServerSchema = z.object({
    id_servidor: z.number(),
    nombre_servidor: z.string(),
    direccion_ip: z.string(),
    descripcion: z.string().nullable().optional(),
    id_tipo_acceso: z.number(),
    id_nivel_criticidad: z.number(),
    id_estado: z.number(),
    fecha_registro: z.string().optional(),
});
export type Server = z.infer<typeof ServerSchema>;

export const ServerCheckResponseSchema = z.object({
    message: z.string(),
    server: z.any() // Usamos any temporalmente para asegurar que no se bloquee por validación estricta
});
export type ServerCheckResponse = z.infer<typeof ServerCheckResponseSchema>;

export const InstanceSchema = z.object({
    id_instancia: z.number(),
    nombre_instancia: z.string(),
    puerto: z.number(),
    id_dbms: z.number(),
});
export type Instance = z.infer<typeof InstanceSchema>;

export const DbmsSchema = z.object({
    id_dbms: z.number(),
    nombre_dbms: z.string(),
    version: z.string(),
});
export type Dbms = z.infer<typeof DbmsSchema>;

export const CredentialSchema = z.object({
    id_credencial: z.number(),
    usuario: z.string(),
    id_tipo_acceso: z.number(),
});
export type Credential = z.infer<typeof CredentialSchema>;

export const CriticalitySchema = z.object({
    id_nivel_criticidad: z.number(),
    nombre_nivel: z.string(),
    descripcion: z.string().optional(),
});
export type Criticality = z.infer<typeof CriticalitySchema>;

// --- Respaldos ---
export const BackupPolicySchema = z.object({
    id_politica: z.number(),
    nombre_politica: z.string(),
    frecuencia: z.string(),
    hora_ejecucion: z.string(), // Viene como time string
});
export type BackupPolicy = z.infer<typeof BackupPolicySchema>;

export const BackupPathSchema = z.object({
    id_ruta: z.number(),
    path: z.string(),
    id_tipo_almacenamiento: z.number(),
});
export type BackupPath = z.infer<typeof BackupPathSchema>;

export const BackupHistorySchema = z.object({
    id_respaldo: z.number(),
    id_base_datos: z.number(),
    fecha_inicio: z.string(),
    id_estado_ejecucion: z.number(),
    tamano_bytes: z.number(),
});
export type BackupHistory = z.infer<typeof BackupHistorySchema>;

// --- Monitoreo ---
export const AlertSchema = z.object({
    id_alerta: z.number(),
    descripcion: z.string(),
    fecha_alerta: z.string(),
    resuelta: z.boolean(),
});
export type Alert = z.infer<typeof AlertSchema>;

export const AlertLevelSchema = z.object({
    id_nivel_alerta: z.number(),
    nombre_nivel: z.string(),
    color_hex: z.string(),
});
export type AlertLevel = z.infer<typeof AlertLevelSchema>;

export const MonitoringSummarySchema = z.object({
    total_databases: z.number(),
    total_size_mb: z.number(),
});
export type MonitoringSummary = z.infer<typeof MonitoringSummarySchema>;

export const HostMetricsSchema = z.object({
    cpu_usage: z.number(),
    ram_usage: z.number(),
    disk_usage: z.number(),
    uptime: z.string(),
});
export type HostMetrics = z.infer<typeof HostMetricsSchema>;

export const MySQLMetricsSchema = z.object({
    connections: z.number(),
    queries_per_second: z.number(),
    uptime: z.number(),
});
export type MySQLMetrics = z.infer<typeof MySQLMetricsSchema>;

export const MongoDBMetricsSchema = z.object({
    op_counters: z.record(z.any()),
    mem_usage: z.number(),
});
export type MongoDBMetrics = z.infer<typeof MongoDBMetricsSchema>;

// --- Auditoría ---
export const AuditLogSchema = z.object({
    id_bitacora: z.number(),
    id_usuario: z.number(),
    entidad: z.string(),
    descripcion: z.string(),
    fecha_evento: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditEventTypeSchema = z.object({
    id_tipo_evento: z.number(),
    nombre_evento: z.string(),
});
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;