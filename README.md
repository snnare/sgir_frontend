# SGIR Frontend - Sistema de Gestión de Infraestructura y Respaldos

Este proyecto es la interfaz de usuario para el SGIR, diseñada para proporcionar a los SRE (Site Reliability Engineers) una herramienta robusta de control de activos y automatización de respaldos.

## 🚀 Tecnologías Core
- **React 19** + **TypeScript**
- **Vite** (Build tool)
- **Material UI (MUI)** (Componentes y Estilos)
- **Zustand** (Gestión de estado con persistencia)
- **Zod** (Validación de esquemas de datos)
- **React Hook Form** (Gestión de formularios)

## 🛠️ Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad
- Login con persistencia extendida ("Recuérdame").
- **Toggle de visibilidad de contraseña** en Login y Registro.
- Flujo de registro y gestión de perfil de usuario.
- Rutas protegidas con inyección automática de tokens JWT.
- Manejo proactivo de sesiones expiradas (Auto-logout en 401).

### 📊 Monitoreo Real-Time e Histórico
- **Arquitectura de Bajo Latencia (Live Cache)**: Consulta masiva a la memoria RAM del backend (`/live-cache`) con soporte para formatos comprimidos de métricas.
- **Centro de Alertas del Día**: KPI en el panel principal que muestra incidencias de las últimas 24 horas con códigos de color de severidad.
- **Bitácora de Actividad (Auditoría)**: Historial completo de cambios en el sistema (quién, qué y cuándo) con soporte para **paginación dinámica** y filtrado avanzado.
- **Control Inteligente del Scheduler**: Mando flotante que se auto-esconde en estado saludable y se activa mediante hover en la esquina superior derecha.
- **Monitoreo de Bases de Datos Multi-Motor**: Observabilidad reactiva y en tiempo real de estados de salud (`healthy`, `critical`, `fatal`, `stale`, `unknown`) y métricas de desempeño (`ping`, `capacity_pct`, `stuck_processes`, `specific_value`) con estrategias de polling controlado y estado Zustand aislado del hardware.

### 🏗️ Gestión de Inventario y Activos
- **Inventario CMDB Real**: Búsqueda global enriquecida (`/inventory/assets`) que cruza Servidor -> Instancia -> Bases de Datos.
- **Auto-Descubrimiento de BD**: Wizard guiado para sincronizar automáticamente el inventario de bases de datos.
- **Gestión de FileSystems (SSH)**: Administrador de almacenamiento que descubre particiones físicas y permite registrar discos específicos para monitoreo.
- **Alcance de Monitoreo Selectivo**: Configuración granular para activar monitoreo de Host y Base de Datos de forma independiente.
- **Módulo de Políticas**: Gestión completa (CRUD) de reglas de respaldo automatizado.

### 🎨 Experiencia de Usuario (UI/UX)
- **Componentes Estandarizados**:
  - `FilterBar`: Barra de búsqueda y filtrado unificada en todas las pantallas principales.
  - `FloatingActionGroup`: Botones de acción flotantes (FAB) para creación y carga masiva.
- **Dashboard de Alta Densidad**: Tarjetas de servidor optimizadas para monitorear múltiples activos simultáneamente.
- **Localización Completa**: Interfaz 100% en español orientada a la terminología SRE.
- **Diseño Glassmorphism**: Controles flotantes con desenfoque de fondo y sombras profundas para una estética moderna.

## 📥 Kit de Importación
El sistema incluye un kit descargable (.zip) en el módulo de Carga Masiva que contiene la plantilla técnica oficial y el manual de instrucciones.

## 📦 Instalación y Desarrollo

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   pnpm install
   ```
3. Configurar variables de entorno en un archivo `.env`.
4. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

---
Diseñado para la eficiencia operativa y la seguridad de datos.

### 🛢️ Monitoreo Unificado de Bases de Datos (Live Cache de 15 posiciones)
Se ha implementado el soporte en frontend para el **Live Cache Unificado de Bases de Datos** (`GET /sgir/v1/m1/db/live-cache`). Esta arquitectura permite decodificar de forma ultra-eficiente un string de métricas plano de 15 posiciones que unifica el estado de múltiples RDBMS (MySQL, Oracle, MongoDB) bajo los mismos índices:
- **Estructura del string piped**: `status|uptime|threads_connected|max_connections|conn_usage_pct|threads_running|questions|queries_per_second|slow_queries|table_locks_waited|innodb_row_lock_waits|innodb_row_lock_time_avg|innodb_buffer_pool_pages_dirty|hit_ratio/specific|timestamp`
- **Mapeo Inteligente**: Descompresión automática en el cliente para mostrar el estado en tiempo real, QPS, uso de conexiones y métricas críticas específicas del motor (ej: hit ratio en MySQL o tablespace en Oracle) sin penalizar el rendimiento del servidor.

