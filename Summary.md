# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión:** `SGIR-SESSION-2026-05-20-UI-ANIMATIONS-INTEGRATION`

## 1. Refactorización y Pulido de UI
- **MetricCard Evolucionado**: 
  - Se añadió interactividad (`onClick`) con efectos de elevación al pasar el mouse.
  - Implementación de **Animación de Latido (Pulse)**: Los iconos de métricas críticas (>85%) ahora laten sutilmente para alertar visualmente al SRE.
- **Floating Components Theme-Aware**: El control flotante del scheduler y la barra de eliminación masiva en `HomePage` ahora detectan el modo claro/oscuro para garantizar legibilidad y contraste.
- **Limpieza en AddServerPage**: Se simplificó el asistente de registro eliminando pasos redundantes y elementos visuales innecesarios (flechas de navegación interna y botones de cancelación duplicados).
- **Homogeneización del Grid de Performance de RDBMS**: 
  - Re-diseñamos el monitoreo de bases de datos en `ServerCard.tsx` para seguir exactamente el mismo lenguaje visual de CPU, RAM y Disco.
  - Ahora, cada instancia de base de datos activa despliega una mini-cabecera identificativa y una **grilla de 3 columnas de `CompactMetric`** (`CON`, `QPS` y `Métrica Crítica`).
  - **Tooltips SRE Detallados**: Cada cajita de métrica cuenta con un tooltip enriquecido al pasar el mouse (`CON` muestra hilos activos/máximos, `QPS` muestra consultas/segundo e hilos corriendo, y la métrica de eficiencia del motor muestra explicaciones y porcentajes específicos como *Hit Ratio* para MySQL, *Tablespace* para Oracle u *Oplog* para MongoDB).

## 2. Estandarización de Componentes
- **StatusChip Reutilizable**: Creación de un componente global que unifica el mapeo de estados del sistema (Activo, Inactivo, Pendiente, Éxito, Fallo, etc.), asegurando coherencia visual en todas las tablas.
- **Buscador de Alertas**: Integración de `FilterBar` en el Centro de Alertas, permitiendo filtrado por nivel de criticidad y búsqueda por ID de servidor o descripción.
- **Formularios Inteligentes**: En el registro de credenciales, el botón "Test Conexión" ahora se habilita dinámicamente solo cuando los campos requeridos están completos, evitando peticiones inválidas.

## 3. Integración y Corrección de API
- **Endpoint Discovery Fix**: Corrección del endpoint de descubrimiento de sistemas de archivos (`discover-filesystems`). Se migró de `GET` a `POST` para evitar conflictos de ruta en el backend y unificar el patrón con el resto de módulos de descubrimiento (M2/M3).
- **Navegación Intuitiva**: Vinculación directa entre los KPIs del Panel Principal y sus respectivas vistas de detalle (ej. clic en alertas redirige al Centro de Alertas).

## 4. Monitoreo de Bases de Datos Multi-Motor (Live Cache & Params)
- **Caché en Vivo Unificada (15 posiciones)**: 
  - Definición del esquema Zod `ParsedDBLiveMetricsSchema` y tipado para descomprimir el payload unificado de base de datos (`GET /sgir/v1/m1/db/live-cache`).
  - Implementación de la función auxiliar `parseDBLiveMetricsString` para segmentar por tuberías (`|`) los 15 campos de rendimiento (conexiones, bloqueos, QPS, hit ratio, etc.) y guardarlos reactivamente en `dbLiveMetricsUnified` dentro del store.
  - Soporte híbrido en la acción `fetchDBLiveMetricsUnified` para procesar payloads planos (Scheduler) y objetos JSON estructurados (ejecución manual).
- **Soporte para Parámetros de Conexión (`parametros_conexion`)**:
  - Incorporación del campo opcional JSON `parametros_conexion` en `InstanceSchema` y anidación de `instancias` dentro de `ServerSchema`.
  - **Asistente de Registro All-in-One (`ServerForm.tsx`)**: Integración de la sección "Configuración de Motor de Base de Datos" directamente dentro del primer paso del alta de servidores. Registra transaccionalmente el Servidor y su Instancia DBMS asociada (puerto autocompletado y Oracle `ORACLE_SID` condicional) de forma secuencial y transparente.
  - **Formulario de Instancias DBMS Autónomo Avanzado (`InstanceForm.tsx`)**: Refactorización completa para consumir catálogos reales de Svr/DBMS de la CMDB, añadir soporte explícito de SID/Service Name para Oracle, authSource para MongoDB, y un editor colapsable para parámetros JSON genéricos.
  - **Tooltip de Inspección CMDB**: Las tarjetas de servidor despliegan un Tooltip al pasar el mouse por encima del nombre de la instancia que revela inmediatamente sus parámetros de conexión guardados (como el SID).

## 5. Enrutamiento Inteligente para Pruebas de Conexión de Oracle
- **Discriminador de Servidores Legacy / Estándar**: 
  - Al realizar el "Test Conexión" para Oracle en `CredentialForm.tsx`, el frontend consulta dinámicamente la propiedad `es_legacy` del servidor actual en el store.
  - Si el servidor es **Legacy**, enruta de forma automática y transparente la petición a: `POST /crud/conexion/test/db/oracle/legacy`.
  - Si el servidor es **Estándar (No-Legacy)**, enruta la petición a: `POST /crud/conexion/test/db/oracle/no-legacy`.

---

### 🟢 ¿Dónde nos quedamos?
Se ha integrado con éxito todo el andamiaje del monitoreo de bases de datos multi-motor en el frontend (esquemas Zod, tipos de TypeScript, servicio API de red, estado reactivo en Zustand y hooks de consulta con polling inteligente) sin interferir en absoluto con el monitoreo de hardware existente.

### 🟡 ¿Qué falta por hacer?
- **Módulo de Expiración**: Lógica para purga de respaldos antiguos.
- **Gráficas de Rendimiento**: Vistas de detalle con historial de métricas de host y BD.
- **Reportes Dinámicos**: Exportación de PDF/CSV del inventario y salud.
