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

### 🏗️ Gestión de Inventario (Infraestructura)
- **Alta de Servidores**: Formulario inteligente con detección de criticidad.
- **Importación Masiva**: Motor de carga vía CSV con soporte para:
  - Consolidación por IP (Upsert).
  - Traducción automática de catálogos.
  - Cifrado de credenciales on-the-fly.
  - **Diagnóstico avanzado**: Logs detallados en consola para depuración de validaciones.
- **Setup Wizard**: Configuración guiada post-registro para monitoreo y accesos SSH/DB.

### 📊 Monitoreo y Dashboard
- Panel principal con KPIs de flota (Nodos totales, Online, Alertas).
- Tarjetas técnicas de servidor con métricas de recursos en tiempo real (CPU, RAM, Disco).

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
