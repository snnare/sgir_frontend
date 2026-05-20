# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión:** `SGIR-SESSION-2026-05-20-UI-ANIMATIONS-INTEGRATION`

## 1. Refactorización y Pulido de UI
- **MetricCard Evolucionado**: 
  - Se añadió interactividad (`onClick`) con efectos de elevación al pasar el mouse.
  - Implementación de **Animación de Latido (Pulse)**: Los iconos de métricas críticas (>85%) ahora laten sutilmente para alertar visualmente al administrador.
- **Floating Components Theme-Aware**: El control flotante del scheduler y la barra de eliminación masiva en `HomePage` ahora detectan el modo claro/oscuro para garantizar legibilidad y contraste.
- **Limpieza en AddServerPage**: Se simplificó el asistente de registro eliminando pasos redundantes y elementos visuales innecesarios (flechas de navegación interna y botones de cancelación duplicados).

## 2. Estandarización de Componentes
- **StatusChip Reutilizable**: Creación de un componente global que unifica el mapeo de estados del sistema (Activo, Inactivo, Pendiente, Éxito, Fallo, etc.), asegurando coherencia visual en todas las tablas.
- **Buscador de Alertas**: Integración de `FilterBar` en el Centro de Alertas, permitiendo filtrado por nivel de criticidad y búsqueda por ID de servidor o descripción.
- **Formularios Inteligentes**: En el registro de credenciales, el botón "Test Conexión" ahora se habilita dinámicamente solo cuando los campos requeridos están completos, evitando peticiones inválidas.

## 3. Integración y Corrección de API
- **Endpoint Discovery Fix**: Corrección del endpoint de descubrimiento de sistemas de archivos (`discover-filesystems`). Se migró de `GET` a `POST` para evitar conflictos de ruta en el backend y unificar el patrón con el resto de módulos de descubrimiento (M2/M3).
- **Navegación Intuitiva**: Vinculación directa entre los KPIs del Panel Principal y sus respectivas vistas de detalle (ej. clic en alertas redirige al Centro de Alertas).

---

### 🟢 ¿Dónde nos quedamos?
La interfaz es ahora más "viva" y reactiva gracias a las micro-animaciones y la navegación mejorada. Se ha resuelto un problema crítico de colisión de rutas en el descubrimiento de discos y se ha estandarizado la representación de estados en toda la aplicación.

### 🟡 ¿Qué falta por hacer?
- **Módulo de Expiración**: Lógica para purga de respaldos antiguos.
- **Gráficas de Rendimiento**: Vistas de detalle con historial de métricas.
- **Reportes Dinámicos**: Exportación de PDF/CSV del inventario y salud.
