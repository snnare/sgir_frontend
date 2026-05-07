# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión para Continuar:** `SGIR-SESSION-2026-05-05-MONITORING-REFACTOR`

## 1. Módulos de Monitoreo y Auditoría (Nuevo)
- **Centro de Alertas**: Implementación de la vista global de alertas (`MonitoringAlertsPage`) con clasificación por severidad (Triángulo Rojo/Amarillo) y estado (Pendiente/Resuelta).
- **Explorador de Logs**: Nueva interfaz de historial (`MonitoringLogsPage`) que permite consultar sesiones de monitoreo pasadas y visualizar métricas críticas persistidas (CPU/RAM/Disco > 90%).
- **Optimización Live Cache**: 
  - Se reemplazó el polling individual por servidor por una consulta masiva a `/monitoring/host/live-cache`.
  - Los KPIs del Dashboard (Sanos, Críticos, Alertas) ahora se calculan localmente en el frontend para reducir la carga del backend.
  - Eliminación de dependencia del endpoint `global-summary`.
- **Auto-Activación**: Integración de creación automática de sesiones de monitoreo al finalizar el paso de "Alcance" en el Wizard de registro.

## 2. Inventario y Backups
- **Buscador de Activos**: Creación del módulo `SearchAssetsPage` para localizar instancias de BD con filtros rápidos por motor (Oracle, MySQL, MongoDB).
- **CRUD de Rutas**: Refactorización completa de la gestión de rutas de respaldo a un formato de tabla profesional agrupada por IP de servidor, incluyendo acciones de Editar y Eliminar.
- **Explorador RAW**: Implementación de la herramienta de descubrimiento SSH para archivos físicos en el servidor remoto.

## 3. UI/UX y Branding
- **Modelo de Página Estandarizado**: Aplicación del esquema `[Titulo][Métricas][Acciones][Listas]` en los nuevos módulos para máxima consistencia.
- **Identidad Visual**: Integración del logo corporativo en el portal de acceso y registro (ajuste de tamaños y sombreados para modo oscuro).
- **Configuración de Red y CORS**:
  - Habilitación de acceso por red local (`0.0.0.0`) y `allowedHosts`.
  - Configuración de proxy en Vite para redireccionar `/api` al backend local, eliminando problemas de CORS.
  - Actualización de variables de entorno para usar rutas relativas.
- **Validación Dual de Activos (Nuevo)**:
  - Integración de botón "Check" en el Dashboard y en el **Wizard de Registro**.
  - Realiza dos validaciones simultáneas: disponibilidad administrativa (DB) y conectividad técnica (ICMP Ping).
  - Proporciona feedback diferenciado si el servidor está disponible pero es inalcanzable.

## 4. Correcciones Técnicas y Optimización
- **Optimización Live Cache**: Se implementó una lógica de polling masivo con **Fallback Automático**. Si el caché global está vacío, el sistema consulta métricas individuales para garantizar la visibilidad de datos.
- **Validación ICMP**: Implementación de `pingServer` para diagnósticos rápidos de red.
- **Proxy Vite**: Configuración de red local y bypass de CORS para acceso multi-dispositivo.
- **Debug Logs**: Inclusión de trazas en consola para monitorear el flujo de métricas en tiempo real.

---

### 🟢 ¿Dónde nos quedamos?
La arquitectura de monitoreo ha sido optimizada para alto rendimiento mediante **Live Cache** y cuenta con herramientas de diagnóstico rápidas (**Quick Ping**). El sistema ya es accesible desde la red local y los KPIs del Dashboard son totalmente dinámicos.

### 🟡 ¿Qué falta por hacer?
- **Módulo de Políticas**: Construir la vista de gestión de políticas de respaldo bajo el nuevo estándar de tabla.
- **Detalle de Servidor**: Ampliar la vista individual de servidor para incluir gráficas históricas de las métricas persistidas en la base de datos.
- **Reportes**: Generación de reportes PDF/CSV basados en los logs de monitoreo y efectividad de respaldos.
