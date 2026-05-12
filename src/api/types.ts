import {z} from 'zod'

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
    confirmPassword: z.string().min(6, 'La confirmación es requerida'),
    id_rol: z.number().optional().default(2),
    id_estado_usuario: z.number().optional().default(1),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
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
    id_estado_usuario: z.number(),
    fecha_creacion: z.string().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Esquema para actualización de Usuario (UserUpdate)
export const UserUpdateSchema = z.object({
    nombres: z.string().min(1, 'Los nombres son requeridos'),
    apellidos: z.string().min(1, 'Los apellidos son requeridos'),
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
    id_estado_usuario: z.number().optional(),
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
    id_nivel_criticidad: z.number().int().positive(),
    id_estado_servidor: z.number().int().positive(),
    es_legacy: z.boolean().default(false).optional(),
    monitoreo_host: z.boolean().default(false).optional(),
    monitoreo_db: z.boolean().default(false).optional(),
});

export type ServerCreateInput = z.infer<typeof ServerCreateSchema>;

export const ServerUpdateSchema = z.object({
    nombre_servidor: z.string().min(1, 'El nombre es requerido').optional(),
    direccion_ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP v4 inválida').optional(),
    descripcion: z.string().optional(),
    id_nivel_criticidad: z.number().int().positive().optional(),
    id_estado_servidor: z.number().int().positive().optional(),
    es_legacy: z.boolean().optional(),
    monitoreo_host: z.boolean().optional(),
    monitoreo_db: z.boolean().optional(),
});

export type ServerUpdateInput = z.infer<typeof ServerUpdateSchema>;

export const ServerSchema = z.object({
    id_servidor: z.number(),
    nombre_servidor: z.string(),
    direccion_ip: z.string(),
    es_legacy: z.boolean().default(false),
    monitoreo_host: z.boolean().default(false),
    monitoreo_db: z.boolean().default(false),
    descripcion: z.string().nullable().optional(),
    id_nivel_criticidad: z.number(),
    id_estado_servidor: z.number(),
    fecha_registro: z.string().optional(),
});
export type Server = z.infer<typeof ServerSchema>;

export const ServerCheckResponseSchema = z.object({
    message: z.string(),
    server: z.any() 
});
export type ServerCheckResponse = z.infer<typeof ServerCheckResponseSchema>;

export const InstanceSchema = z.object({
    id_instancia: z.number(),
    nombre_instancia: z.string(),
    puerto: z.number(),
    id_servidor: z.number(),
    id_dbms: z.number(),
    id_estado_instancia: z.number(),
    fecha_inicio: z.string().optional(),
});
export type Instance = z.infer<typeof InstanceSchema>;

export const DbmsSchema = z.object({
    id_dbms: z.number(),
    nombre_dbms: z.string(),
    version: z.string(),
    descripcion: z.string().optional(),
});
export type Dbms = z.infer<typeof DbmsSchema>;

export const DatabaseSchema = z.object({
    id_base_datos: z.number(),
    nombre_base: z.string(),
    tamano_mb: z.number().nullable().optional(),
    fecha_creacion: z.string().optional(),
    id_instancia: z.number(),
    id_estado_bd: z.number(),
});
export type Database = z.infer<typeof DatabaseSchema>;

export const CredentialSchema = z.object({
    id_credencial: z.number(),
    usuario: z.string(),
    id_tipo_acceso: z.number(),
    id_estado_credencial: z.number(),
    id_servidor: z.number(),
});

export const CredentialEnrichedSchema = z.object({
    id_credencial: z.number(),
    usuario: z.string(),
    fecha_creacion: z.string().optional(),
    id_servidor: z.number(),
    servidor_nombre: z.string(),
    tipo: z.object({
        id_tipo_acceso: z.number(),
        nombre_tipo: z.string(),
    }),
    estado: z.object({
        id_estado: z.number(),
        nombre_estado: z.string(),
    }),
});

export type Credential = z.infer<typeof CredentialSchema>;
export type CredentialEnriched = z.infer<typeof CredentialEnrichedSchema>;

export const CredentialUpdateSchema = z.object({
    usuario: z.string().min(1, 'El usuario es requerido').optional(),
    password: z.string().min(1, 'La contraseña es requerida').optional(),
    id_tipo_acceso: z.number().int().positive().optional(),
    id_servidor: z.number().int().positive().optional(),
    id_estado_credencial: z.number().int().positive().optional(),
});

export type CredentialUpdateInput = z.infer<typeof CredentialUpdateSchema>;

export const CredentialCreateSchema = z.object({
    usuario: z.string().min(1, 'El usuario es requerido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    id_tipo_acceso: z.number().int().positive(),
    id_servidor: z.number().int().positive(),
    id_estado_credencial: z.number().int().positive().default(1),
});

export type CredentialCreateInput = z.infer<typeof CredentialCreateSchema>;


export const CriticalitySchema = z.object({
    id_nivel_criticidad: z.number(),
    nombre_nivel: z.string(),
    descripcion: z.string().optional(),
});
export type Criticality = z.infer<typeof CriticalitySchema>;

export const GeneralStatusSchema = z.object({
    id_estado: z.number(),
    nombre_estado: z.string(),
});
export type GeneralStatus = z.infer<typeof GeneralStatusSchema>;

// --- Respaldos ---
export const BackupPolicySchema = z.object({
    id_politica: z.number(),
    nombre_politica: z.string(),
    descripcion: z.string().nullable().optional(),
    frecuencia_horas: z.number(),
    retencion_dias: z.number(),
    id_tipo_respaldo: z.number(),
    id_estado_politica: z.number(),
});
export type BackupPolicy = z.infer<typeof BackupPolicySchema>;

export const BackupPolicyCreateSchema = z.object({
    nombre_politica: z.string().min(1, 'El nombre es requerido'),
    descripcion: z.string().optional(),
    frecuencia_horas: z.coerce.number().int().positive('Debe ser mayor a 0'),
    retencion_dias: z.coerce.number().int().positive('Debe ser mayor a 0'),
    id_tipo_respaldo: z.number().int().positive(),
    id_estado_politica: z.number().int().positive().default(1),
});
export type BackupPolicyCreateInput = z.infer<typeof BackupPolicyCreateSchema>;

export const BackupPathSchema = z.object({
    id_ruta: z.number(),
    descripcion_ruta: z.string(),
    path: z.string(),
    id_tipo_almacenamiento: z.number(),
    id_estado_ruta: z.number(),
    id_servidor: z.number().optional(),
});
export type BackupPath = z.infer<typeof BackupPathSchema>;

export const BackupPathCreateSchema = z.object({
    descripcion_ruta: z.string().min(1, 'La descripción es requerida'),
    path: z.string().min(1, 'El path es requerido'),
    id_tipo_almacenamiento: z.number().int().positive(),
    id_estado_ruta: z.number().int().positive().default(1),
    id_servidor: z.number().int().positive().optional(),
});
export type BackupPathCreateInput = z.infer<typeof BackupPathCreateSchema>;

export const BackupDiscoveryResponseSchema = z.object({
    status: z.string(),
    servidor: z.string(),
    ruta: z.string(),
    archivos_fisicos_totales: z.number(),
    peso: z.string(),
    lista_archivos: z.array(z.string()),
});
export type BackupDiscoveryResponse = z.infer<typeof BackupDiscoveryResponseSchema>;

export const BackupHistorySchema = z.object({
    id_respaldo: z.number(),
    id_base_datos: z.number(),
    id_politica: z.number(),
    id_credencial: z.number(),
    id_ruta_respaldo: z.number(),
    fecha_inicio: z.string(),
    fecha_fin: z.string().nullable().optional(),
    tamano_mb: z.number().nullable().optional(),
    id_estado_ejecucion: z.number(),
    hash_integridad: z.string().optional(),
});
export type BackupHistory = z.infer<typeof BackupHistorySchema>;

// --- Monitoreo ---
export const SchedulerStatusSchema = z.object({
    status: z.enum(['running', 'paused', 'stopped']),
    message: z.string().optional(),
});

export type SchedulerStatus = z.infer<typeof SchedulerStatusSchema>;

export const HealthStatusSchema = z.object({
    status: z.enum(['healthy', 'critical', 'stale', 'unknown']),
    last_check: z.string(),
    is_stale: z.boolean(),
    live_metrics: z.object({
        cpu: z.number(),
        ram: z.number(),
        disks: z.record(z.string(), z.number()),
        uptime: z.number(),
        timestamp: z.number(),
    })
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const GlobalSummarySchema = z.object({
    sanos: z.number(),
    criticos: z.number(),
    desactualizados: z.number(),
});

export type GlobalSummary = z.infer<typeof GlobalSummarySchema>;

export const AlertSchema = z.object({
    id_alerta: z.number(),
    descripcion: z.string(),
    fecha_alerta: z.string(),
    id_servidor: z.number(),
    id_monitoreo: z.number().nullable().optional(),
    id_nivel_alerta: z.number(),
    id_estado_alerta: z.number(),
});
export type Alert = z.infer<typeof AlertSchema>;

export const AlertLevelSchema = z.object({
    id_nivel_alerta: z.number(),
    nombre_nivel: z.string(),
    color_hex: z.string().optional(), // Mantenemos opcional por si el frontend lo requiere
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
    op_counters: z.record(z.string(), z.any()),
    mem_usage: z.number(),
});
export type MongoDBMetrics = z.infer<typeof MongoDBMetricsSchema>;

// --- Monitoreo CRUD ---
export const MonitoringSessionSchema = z.object({
    id_monitoreo: z.number(),
    id_servidor: z.number(),
    id_estado_monitoreo: z.number(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().nullable().optional(),
});
export type MonitoringSession = z.infer<typeof MonitoringSessionSchema>;

export const MetricTypeSchema = z.object({
    id_tipo_metrica: z.number(),
    nombre_metrica: z.string(),
    unidad_medida: z.string(),
});
export type MetricType = z.infer<typeof MetricTypeSchema>;

export const MetricSchema = z.object({
    id_metrica: z.number(),
    valor: z.number(),
    fecha_recoleccion: z.string(),
    id_monitoreo: z.number(),
    id_tipo_metrica: z.number(),
    tipo: MetricTypeSchema.optional(),
});
export type Metric = z.infer<typeof MetricSchema>;

export const MonitoringSessionDetailSchema = MonitoringSessionSchema.extend({
    metrics: z.array(MetricSchema),
});
export type MonitoringSessionDetail = z.infer<typeof MonitoringSessionDetailSchema>;

export const MonitoringCreateSchema = z.object({
    id_servidor: z.number().int().positive(),
    id_estado_monitoreo: z.number().int().positive().default(1),
});
export type MonitoringCreateInput = z.infer<typeof MonitoringCreateSchema>;

// --- Auditoría ---
export const AuditLogSchema = z.object({
    id_bitacora: z.number(),
    id_usuario: z.number(),
    id_tipo_evento: z.number(),
    id_entidad: z.number(),
    entidad_afectada: z.string(),
    descripcion_evento: z.string(),
    fecha_evento: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditEventTypeSchema = z.object({
    id_tipo_evento: z.number(),
    nombre_evento: z.string(),
});
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

// --- Inventario y Activos ---
export const AssetDatabaseSchema = z.object({
    nombre: z.string(),
    tamano_mb: z.coerce.number().nullable().optional(),
    estado: z.string(),
});

export const AssetSchema = z.object({
    ip: z.string(),
    motor: z.string(),
    instancia: z.string(),
    servidor: z.string(),
    criticidad: z.string(),
    bases_de_datos: z.array(AssetDatabaseSchema),
});
export type Asset = z.infer<typeof AssetSchema>;
export type AssetDatabase = z.infer<typeof AssetDatabaseSchema>;

export const DiscoveryResponseSchema = z.object({
    instancia: z.string(),
    total_encontradas: z.number(),
    creadas: z.number(),
    actualizadas: z.number(),
    desactivadas: z.number(),
});
export type DiscoveryResponse = z.infer<typeof DiscoveryResponseSchema>;

export const GlobalDiscoveryDetailSchema = z.object({
    instancia: z.string(),
    status: z.enum(['success', 'failed']),
    nuevas: z.number().optional(),
    actualizadas: z.number().optional(),
    desactivadas: z.number().optional(),
    error: z.string().optional(),
});

export const GlobalDiscoveryResponseSchema = z.object({
    total_instancias_encontradas: z.number(),
    instancias_procesadas_exitosamente: z.number(),
    instancias_fallidas: z.number(),
    omitidas_sin_credenciales: z.number(),
    detalles: z.array(GlobalDiscoveryDetailSchema),
    total_db_size_mb: z.coerce.number(),
});

export type GlobalDiscoveryResponse = z.infer<typeof GlobalDiscoveryResponseSchema>;
export type GlobalDiscoveryDetail = z.infer<typeof GlobalDiscoveryDetailSchema>;

// --- Monitoreo Host y Particiones ---
export const FilesystemSchema = z.object({
    source: z.string(),
    size: z.string(),
    used: z.string(),
    avail: z.string(),
    usage_pct: z.string(),
    mount_point: z.string(),
});
export type Filesystem = z.infer<typeof FilesystemSchema>;

export const FilesystemDiscoveryResponseSchema = z.object({
    id_server: z.number(),
    ip_server: z.string(),
    legacy: z.boolean(),
    filesystems: z.array(FilesystemSchema),
});
export type FilesystemDiscoveryResponse = z.infer<typeof FilesystemDiscoveryResponseSchema>;

export const PartitionUpsertSchema = z.object({
    id_servidor: z.number(),
    path: z.string(),
    etiqueta: z.string().optional(),
});
export type PartitionUpsertInput = z.infer<typeof PartitionUpsertSchema>;

// --- Importación Masiva ---
export const ImportErrorSchema = z.object({
    fila: z.number(),
    error: z.string(),
});

export const ImportSummarySchema = z.object({
    total_filas: z.number(),
    servidores_procesados: z.number(),
    instancias_procesadas: z.number(),
    credenciales_procesadas: z.number(),
    errores: z.array(ImportErrorSchema),
});

export type ImportError = z.infer<typeof ImportErrorSchema>;
export type ImportSummary = z.infer<typeof ImportSummarySchema>;
