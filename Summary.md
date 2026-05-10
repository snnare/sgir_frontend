# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión:** `SGIR-SESSION-2026-05-08-SELECTIVE-MONITORING-CMDB`

## 1. Monitoreo Selectivo y Registro
- **Alcance por Servidor**: Integración de los flags `monitoreo_host` y `monitoreo_db` en el modelo de Servidor.
- **Wizard Multi-Paso Mejorado**: 
    - Se invirtió el flujo para elegir el alcance antes de los datos técnicos.
    - Soporte para registro de múltiples credenciales (SSH + DB) en un mismo flujo.
    - Navegación mejorada con botones Home y Flecha de paso anterior en el encabezado.
- **Formulario de Credenciales Híbrido**: `CredentialForm` ahora soporta modo standalone con selección manual de servidor y auto-sincronización de IP para test de conexión.

## 2. Inventario CMDB y Auto-Descubrimiento
- **Vista Enriquecida**: Tabla de búsqueda global (`/activos`) conectada a datos reales del backend con filtros de motores dinámicos.
- **Discovery Wizard (Bases de Datos)**: Asistente modal para sincronizar automáticamente el inventario de bases de datos resolviendo las dependencias (Servidor -> Instancia -> Credencial).
- **Disk Manager (FileSystems)**: Componente centralizado en la edición del servidor que descubre particiones vía SSH y permite registrar discos específicos (Upsert) para el monitoreo, protegiendo la partición raíz (`/`).

## 3. UI de Alta Densidad (PRTG Style)
- **Componente CompactMetric**: Visualización horizontal densa con códigos de color de severidad.
- **ServerCard Refactorizada**: 
    - Diseño de dos filas fijas (Hardware vs RDBMS) para soportar dashboards de 30+ servidores.
    - Implementación de **Sensores Ghost** (atenuados y con borde punteado) para capas de monitoreo no configuradas.
- **Integración Fluida**: Enlaces directos desde la ServerCard y el final del Wizard de Registro hacia el administrador de almacenamiento.

---

### 🟢 ¿Dónde nos quedamos?
El frontend ha consolidado su arquitectura de grado SRE. Se implementó el auto-descubrimiento tanto para motores de base de datos como para particiones físicas (SSH), integrando ambos en flujos de usuario lógicos y protegidos.

### 🟡 ¿Qué falta por hacer?
- **Módulo de Expiración**: Lógica para purga de respaldos antiguos.
- **Gráficas de Rendimiento**: Vistas de detalle con historial de métricas.
- **Reportes Dinámicos**: Exportación de PDF/CSV del inventario y salud.
