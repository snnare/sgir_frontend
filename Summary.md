# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión para Continuar:** `SGIR-SESSION-2026-05-05-MONITORING-REFACTOR`

## 1. Módulos de Monitoreo y Auditoría (Nuevo)
- **Centro de Alertas**: Implementación de la vista global de alertas (`MonitoringAlertsPage`) con clasificación por severidad (Triángulo Rojo/Amarillo) y estado (Pendiente/Resuelta).
- **Explorador de Logs**: Nueva interfaz de historial (`MonitoringLogsPage`) que permite consultar sesiones de monitoreo pasadas y visualizar métricas críticas persistidas (CPU/RAM/Disco > 90%).
- **Optimización de KPIs**: Se reemplazó "Desactualizados" por **"Alertas Activas"** en el dashboard principal para una respuesta operativa más rápida.
- **Auto-Activación**: Integración de creación automática de sesiones de monitoreo al finalizar el paso de "Alcance" en el Wizard de registro.

## 2. Inventario y Backups
- **Buscador de Activos**: Creación del módulo `SearchAssetsPage` para localizar instancias de BD con filtros rápidos por motor (Oracle, MySQL, MongoDB).
- **CRUD de Rutas**: Refactorización completa de la gestión de rutas de respaldo a un formato de tabla profesional agrupada por IP de servidor, incluyendo acciones de Editar y Eliminar.
- **Explorador RAW**: Implementación de la herramienta de descubrimiento SSH para archivos físicos en el servidor remoto.

## 3. UI/UX y Branding
- **Modelo de Página Estandarizado**: Aplicación del esquema `[Titulo][Métricas][Acciones][Listas]` en los nuevos módulos para máxima consistencia.
- **Identidad Visual**: Integración del logo corporativo en el portal de acceso y registro (ajuste de tamaños y sombreados para modo oscuro).
- **Correcciones Técnicas**:
  - Limpieza de advertencias de React 19/MUI 9 relacionadas con la sanitización de props en componentes `Stack` y `ListItemText`.
  - Resolución de errores de referencia de componentes en `App.tsx` y `Sidebar.tsx`.

---

### 🟢 ¿Dónde nos quedamos?
La infraestructura de monitoreo (viva e histórica) y el catálogo de activos están plenamente operativos. El sistema ya cuenta con una lógica de alertas clara y un explorador de logs detallado.

### 🟡 ¿Qué falta por hacer?
- **Módulo de Políticas**: Construir la vista de gestión de políticas de respaldo bajo el nuevo estándar de tabla.
- **Detalle de Servidor**: Ampliar la vista individual de servidor para incluir gráficas históricas de las métricas persistidas en la base de datos.
- **Reportes**: Generación de reportes PDF/CSV basados en los logs de monitoreo y efectividad de respaldos.
