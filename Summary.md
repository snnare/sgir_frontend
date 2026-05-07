# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión:** `SGIR-SESSION-2026-05-07-MONITORING-POLICIES-REFACTOR`

## 1. Módulos de Monitoreo y Salud (Actualizado)
- **Refactorización Live Cache**: 
  - Implementación de un parser inteligente en el frontend para manejar el formato comprimido del backend (`status|last_check|is_stale|cpu|ram|disks|uptime|timestamp`).
  - Normalización automática de datos: el sistema acepta ahora múltiples formatos (JSON estructurado, String comprimido, Métricas directas) garantizando la estabilidad de la UI.
  - Los KPIs del Dashboard ahora se calculan en base al inventario cargado vs el caché de salud real.
- **Sincronización de Estados**: Integración de los estados `healthy`, `critical`, `stale` y `unknown` en las tarjetas de servidor (`ServerCard`).
- **Control del Scheduler**: Actualización de los endpoints de gestión del motor SSH (`/pause`, `/resume`, `/status`) con soporte para el nuevo estado `stopped`.

## 2. Inventario y Backups (Nuevo Módulo)
- **Gestión de Políticas de Respaldo**: 
  - Creación del módulo completo CRUD para políticas de respaldo.
  - Interfaz de listado (`BackupPoliciesPage`) con métricas de frecuencia y retención promedio.
  - Formulario estandarizado (`BackupPolicyForm`) con validación Zod y `react-hook-form`.
- **Diagnóstico Quick Ping**: Actualización del servicio de ping para manejar la respuesta booleana del backend y mostrar el estado de alcanzabilidad en el Dashboard y Wizard de Registro.

## 3. Seguridad y API Client
- **Interceptor de Autenticación**: Refactorización de `client.ts` para obtener el token dinámicamente del store de Zustand.
- **Manejo de Sesiones**: Implementación de auto-logout proactivo ante errores 401 (Token expirado/inválido).
- **Silent Errors**: Se silenciaron los logs de consola para errores 404 controlados (como la verificación de IP disponible) para mantener una consola limpia.

## 4. Mejoras UI/UX
- **Visualización de Métricas**: Las tarjetas de servidor ahora muestran barras de progreso reales para CPU, RAM y Disco obtenidas del `live-cache`.
- **Tooltip Fixes**: Se corrigieron advertencias de MUI sobre Tooltips aplicados a elementos deshabilitados mediante el uso de wrappers `Box`.
- **Dashboard Cleanup**: Eliminación de logs redundantes de consola en producción simulada.

---

### 🟢 ¿Dónde nos quedamos?
La arquitectura de monitoreo es ahora totalmente compatible con el backend optimizado de bajo consumo. El módulo de políticas de respaldo está 100% funcional y la comunicación con la API es más segura y robusta.

### 🟡 ¿Qué falta por hacer?
- **Módulo de Expiración**: Implementar la lógica para gestionar el ciclo de vida de los respaldos y la purga de archivos antiguos.
- **Detalle de Servidor**: Ampliar la vista individual con gráficas históricas de las métricas persistidas.
- **Reportes**: Generación de informes PDF/CSV basados en salud y efectividad de respaldos.
