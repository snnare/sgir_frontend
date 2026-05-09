# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión:** `SGIR-SESSION-2026-05-08-SELECTIVE-MONITORING-CMDB`

## 1. Monitoreo Selectivo y Registro (Actualizado)
- **Alcance por Servidor**: Integración de los flags `monitoreo_host` y `monitoreo_db` en el modelo de Servidor.
- **Wizard Multi-Paso**: 
    - Se invirtió el flujo para elegir el alcance antes de los datos técnicos.
    - Soporte para registro de múltiples credenciales (SSH + DB) en un mismo flujo.
    - Navegación mejorada con botones Home y Flecha de paso anterior en el encabezado.
- **Validación de IP**: Optimización del endpoint de verificación para manejar estados 404 (Disponible) de forma silenciosa y fluida.

## 2. Inventario CMDB y Búsqueda Real
- **Conexión al Backend**: Sustitución de datos de prueba en `/activos` por datos reales del endpoint `/monitoring/inventory/assets`.
- **Vista Enriquecida**: Tabla de búsqueda global que muestra la relación Servidor -> IP -> Instancia -> Base de Datos con niveles de criticidad reales.
- **Filtros Dinámicos**: Los filtros de motores de base de datos se generan automáticamente basándose en el inventario actual.
- **Data Safety**: Manejo proactivo de valores nulos y errores de tipado (Zod) en la respuesta del backend.

## 3. UI de Alta Densidad (PRTG Style)
- **Componente CompactMetric**: Visualización horizontal densa con códigos de color de severidad (Rojo > 90%, Ámbar > 75%).
- **ServerCard Refactorizada**: 
    - Diseño de dos filas fijas (Hardware vs RDBMS) para soportar dashboards de 30+ servidores.
    - Implementación de **Sensores Ghost** (atenuados y con borde punteado) para capas de monitoreo no configuradas.
- **Interactividad Contextual**: Botón de edición directa en el sensor de disco para configurar rutas de almacenamiento.

---

### 🟢 ¿Dónde nos quedamos?
El frontend es ahora una herramienta de grado industrial capaz de manejar grandes volúmenes de activos con una visualización clara y técnica. El inventario ya refleja la realidad de la base de datos y el flujo de registro asegura que los servidores nazcan con toda la configuración necesaria.

### 🟡 ¿Qué falta por hacer?
- **Auto-Descubrimiento**: Implementar el disparador de descubrimiento automático desde la interfaz de activos.
- **Módulo de Expiración**: Lógica para purga de respaldos antiguos.
- **Gráficas de Rendimiento**: Vistas de detalle con historial de métricas.
- **Reportes Dinámicos**: Exportación de PDF/CSV del inventario y salud.
