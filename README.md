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
- **Optimización de Diagnósticos de Red**: Restricción de consultas del endpoint `health-status` únicamente al ingresar a la vista detallada (`ServerDetailsPage.tsx`), eliminando la llamada redundante desde la página de inicio (`HomePage.tsx`). Gestión robusta de estado ante cachés vacías durante el primer arranque.

### 🏗️ Gestión de Inventario y Activos
- **Inventario CMDB Real**: Búsqueda global enriquecida (`/inventory/assets`) que cruza Servidor -> Instancia -> Bases de Datos.
  - **Doble Vista (Detallada vs. Comprimida)**: Alterna entre ver cada BD de forma individualizada (con IP de servidor abajo) o agrupada por host e instancia RDBMS (con conteo total de esquemas, motor y peso total sumado en MB/GB).
  - **Buscador Inteligente**: Búsqueda reactiva que localiza instancias en la vista compacta analizando de forma recursiva los nombres de las bases de datos contenidas internamente.
  - **Reportes Multiformato**: Descarga binaria autenticada con JWT para reportes planos en **CSV (Crudo Excel)** y estructurados en **PDF (A4 UAEMex)**.
- **Auto-Descubrimiento de BD**: Wizard guiado para sincronizar automáticamente el inventario de bases de datos.
- **Gestión de FileSystems (SSH)**: Administrador de almacenamiento que descubre particiones físicas y permite registrar discos específicos para monitoreo.
- **Alcance de Monitoreo Selectivo**: Configuración granular para activar monitoreo de Host y Base de Datos de forma independiente.
- **Módulo de Políticas**: Gestión completa (CRUD) de reglas de respaldo automatizado.
  - **Importador de Crontab**: Formulario de alta provisto de un parser inteligente de crontab (estándar y corta de 4 campos) para auto-completar rutas, periodicidades, horas y días de forma reactiva, con saneamiento y prevención de solapamiento de etiquetas MUI (`InputLabelProps={{ shrink: true }}`).
- **Filtros de Almacenamiento**: Simplificación del filtro en la sección de Rutas de Respaldo (`BackupPathsPage.tsx`) para admitir únicamente `Disco Local` y `Sharepoint`, alineándose con las directivas de infraestructura.

### 📁 Módulo de Reportes PDF
- **Reportes PDF Offline**: Integración de los endpoints en backend `/assets/sre-pdf-offline` y `/assets/sre-sla-pdf` para la generación local rápida de informes ejecutivos y de SLA sin llamadas externas remotas.
- **Vista de Reportes**: Nueva interfaz `/reportes` en el frontend, integrada con el Sidebar mediante un icono de PDF dedicado (`PictureAsPdfIcon`).

### 💻 Entorno de Demostración Estática (`static/`)
- **Centro de Control Offline**: Ubicado en `/static/index.html`, contiene una versión auto-contenido del Dashboard e integra las 11 vistas principales del sistema.
- **Datos Simulados**: Mínimo de 10 datos de simulación realistas por página (servidores, bases de datos, políticas, rutas, credenciales, alertas, bitácora de auditoría, sesiones y cargas masivas) que permite demostraciones 100% estáticas sin dependencia de un backend activo.

### 🎨 Experiencia de Usuario (UI/UX)
- **Componentes Estandarizados**:
  - `FilterBar`: Barra de búsqueda y filtrado unificada en todas las pantallas principales.
  - `FloatingActionGroup`: Botones de acción flotantes (FAB) para creación y carga masiva.
- **Dashboard de Alta Densidad**: Tarjetas de servidor optimizadas para monitorear múltiples activos simultáneamente.
- **Localización Completa**: Interfaz 100% en español orientada a la terminología SRE.
- **Diseño Glassmorphism**: Controles flotantes con desenfoque de fondo y sombras profundas para una estética moderna.

## 📥 Kit de Importación
El sistema incluye un kit descargable (.zip) en el módulo de Carga Masiva que contiene la plantilla técnica oficial y el manual de instrucciones. Las plantillas CSV (`dtic_servers_imp.csv`) se han actualizado para excluir sistemas Windows y pre-configurar credenciales estandarizadas de monitoreo (`sigr_monitoreo` / `123Nokia`).

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

### 🛢️ Monitoreo Unificado de Bases de Datos (Live Cache & CMDB Integration)
Se ha integrado de forma completa y robusta la observabilidad, registro y validación de bases de datos multi-motor (MySQL, Oracle, MongoDB) en el frontend:
- **Live Cache de 15 posiciones (`GET /sgir/v1/m1/db/live-cache`)**: Mapeo e interpretación segura de un string de métricas plano de 15 posiciones en el cliente. Descomprime en tiempo real conexiones, QPS y métricas críticas de desempeño sin sobrecargar el hardware.
- **Grilla de Rendimiento Homogénea**: Cada instancia DBMS activa en la tarjeta del servidor se dibuja con una mini-cabecera y un grid de 3 columnas de `CompactMetric` (`CON`, `QPS`, `HIT/TBS/OPL`), adaptando semánticamente las etiquetas y tooltips explicativos según el tipo de base de datos.
- **Soporte para Parámetros de Conexión (`parametros_conexion`)**: Gestión completa del campo JSON para registrar el **System Identifier (SID)** y **Service Name** en Oracle, **authSource** en MongoDB, o parámetros JSON libres.
- **Asistente de Registro All-in-One**: El primer paso del alta de servidores (`ServerForm.tsx`) permite capturar dinámicamente los datos del motor DBMS y registrarlos de forma transaccional y secuencial (Servidor $\rightarrow$ Instancia).
- **Test de Conexión Inteligente para Oracle**: El validador de credenciales detecta si el servidor es **Legacy** u **Estándar** para rutear dinámicamente y de forma transparente la prueba de conexión a los endpoints específicos (`oracle/legacy` u `oracle/no-legacy`).
