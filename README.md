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
- Rutas protegidas y manejo de tokens JWT.

### 📊 Monitoreo Real-Time e Histórico
- **Arquitectura de Bajo Latencia**: Consulta directa a la RAM del backend para métricas instantáneas.
- **Global Summary**: Dashboard con indicadores de servidores Sanos, Críticos y Alertas Activas.
- **Explorador de Logs**: Historial de sesiones de monitoreo con detalle de métricas que superaron el umbral crítico (>90%).
- **Centro de Alertas**: Panel centralizado de incidencias con clasificación por severidad (Crítico a Bajo) y seguimiento de estado.
- **Control del Scheduler**: Gestión global del motor de monitoreo SSH desde la Sidebar.

### 🏗️ Gestión de Inventario y Activos
- **Buscador de Activos**: Herramienta de localización rápida de instancias de bases de datos con filtros por motor (MySQL, Oracle, MongoDB).
- **Gestión de Rutas**: Módulo completo (CRUD) para administrar destinos de respaldo vinculados a servidores específicos.
- **Wizard de Registro**: Asistente de 4 pasos que integra datos técnicos, alcance, credenciales y activación automática de monitoreo.
- **Importación Masiva**: Motor de carga vía CSV con soporte multi-partición e instancias.

### 🎨 Experiencia de Usuario (UI/UX)
- **Modelo de Diseño Estandarizado**: Estructura de páginas consistente: `[Título] > [Métricas] > [Acciones] > [Listados]`.
- **Branding Oficial**: Integración de identidad visual corporativa en Login, Registro y Navegación.
- **Sidebar Inteligente**: Menús colapsables para Backups y Monitoreo con auto-hide.

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
