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

### 📊 Monitoreo Real-Time (Live Cache)
- **Arquitectura de Bajo Latencia**: El sistema consulta directamente la memoria RAM del backend (`LIVE_METRICS_CACHE`) para mostrar métricas instantáneas sin sobrecargar la base de datos PostgreSQL.
- **Polling Inteligente**: Actualización automática de salud (CPU, RAM, Disco) cada 15 segundos.
- **Global Summary**: Dashboard con indicadores consolidados de servidores Sanos, Críticos y Desactualizados.
- **Control del Scheduler**: Los administradores pueden activar o pausar el motor de monitoreo SSH globalmente desde la Sidebar o el Dashboard.
- **Alertas Visuales**: Notificación inmediata en UI si el uso de hardware supera el umbral crítico (>90%).

### 🏗️ Gestión de Inventario (Infraestructura)
- **Dashboard Estandarizado**: Panel principal rediseñado con filtros en tiempo real, KPI de salud de flota, ordenamiento por criticidad y soporte para vista de lista o cuadrícula.
- **Wizard de Registro de Servidores**: Asistente único paso a paso para dar de alta datos técnicos, alcance de monitoreo y credenciales sin salir del flujo.
- **Gestión Completa**: Capacidad de editar y eliminar servidores directamente desde la interfaz con actualización en vivo.
- **Importación Masiva**: Motor de carga vía CSV (endpoint `/servidores/import-bulk`) con soporte para:
  - Definición de **múltiples particiones** por servidor.
  - Alta simultánea de **instancias de bases de datos** y credenciales.
  - Consolidación por IP (Upsert automático).
  - Traducción de catálogos y cifrado AES-256 de credenciales.
  - **Diagnóstico avanzado**: Resumen detallado de filas procesadas y reporte de errores en UI.

### 🎨 Experiencia de Usuario (UI/UX)
- Implementación de un patrón de diseño global (`UI_PATTERN.md`).
- **Sidebar Inteligente** con auto-hide (hover para expandir) y submenús colapsables para mantener una interfaz limpia.

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
