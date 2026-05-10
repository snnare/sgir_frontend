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
- **Arquitectura de Bajo Latencia (Live Cache)**: Consulta masiva a la memoria RAM del backend (`/live-cache`) con soporte para formatos comprimidos de métricas para alto rendimiento.
- **Normalización de Salud (Health Status)**: Clasificación de estados unificada (Sano, Crítico, Desactualizado, Desconocido).
- **Explorador de Logs**: Historial de sesiones de monitoreo con detalle de métricas que superaron el umbral crítico (>90%).
- **Centro de Alertas**: Panel centralizado de incidencias con clasificación por severidad y seguimiento de estado.
- **Control del Scheduler**: Gestión global del motor de monitoreo SSH con estados de ejecución en tiempo real (Running, Paused, Stopped).

### 🏗️ Gestión de Inventario y Activos
- **Inventario CMDB Real**: Búsqueda global enriquecida (`/inventory/assets`) que cruza Servidor -> Instancia -> Bases de Datos en una vista centralizada.
- **Auto-Descubrimiento de BD**: Wizard guiado para conectarse a motores registrados y poblar/actualizar la CMDB de forma automatizada.
- **Gestión de FileSystems (SSH)**: Administrador de almacenamiento integrado que descubre particiones físicas (`df -h`) y permite registrar discos específicos (Upsert) para el monitoreo del Scheduler.
- **Alcance de Monitoreo Selectivo**: Configuración granular por servidor para activar/desactivar monitoreo de Host (CPU/RAM/Disk) y Base de Datos independientemente.
- **Wizard de Registro Inteligente**: Asistente dinámico que solicita credenciales múltiples (SSH/DB) según el alcance elegido.
- **Diagnóstico Rápido (Quick Ping)**: Validación ICMP integrada para verificar alcanzabilidad de red y latencia.
- **Módulo de Políticas**: Gestión completa (CRUD) de reglas de respaldo automatizado.

### 🎨 Experiencia de Usuario (UI/UX)
- **Dashboard de Alta Densidad**: Tarjetas de servidor con diseño de "Sensores en Fila" (estilo PRTG) optimizadas para monitorear 30+ activos simultáneamente.
- **Sensores Ghost**: Visualización de capas de monitoreo no configuradas mediante estados atenuados para mantener la consistencia de la cuadrícula.
- **Navegación Contextual**: Acceso directo a la gestión de almacenamiento desde las métricas de disco de cada servidor.
- **Branding Oficial**: Integración de identidad visual corporativa en todo el portal.
- **Sidebar Inteligente**: Menús colapsables y control global del monitoreo integrado.

## 📥 Kit de Importación
El sistema incluye un kit descargable (.zip) en el módulo de Carga Masiva que contiene la plantilla técnica oficial y el manual de instrucciones para asegurar la integridad de los datos importados.

## 📦 Instalación y Desarrollo

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   pnpm install
   ```
3. Configurar variables de entorno en un archivo `.env` (basado en `.env.example`).
4. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

---
Diseñado para la eficiencia operativa y la seguridad de datos.
