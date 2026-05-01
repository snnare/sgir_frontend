# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión para Continuar:** `SGIR-SESSION-2026-04-30-UI-UX-REFACTOR`

Este documento resume las implementaciones realizadas en la infraestructura del frontend para el Sistema de Gestión de Infraestructura y Respaldos (SGIR).

## 1. Patrón de Diseño y UI/UX (Nuevo)
- **Estandarización UI**: Implementación del nuevo patrón de diseño `UI_PATTERN.md` (Header, Métricas, Barra de Control, Listado) en `HomePage` y `CredentialsPage`.
- **Dashboard (`HomePage`)**: Rediseño profesional eliminando saludos informales y estandarizando la terminología ("Panel de Control", "Inventario de Servidores").
- **Sidebar Inteligente**:
  - Función de **Auto-hide** (expansión por hover) para maximizar el espacio de datos.
  - Función de **Anclaje (Pin)** con el icono `PushPin`.
  - **Menús Colapsables**: Las opciones "Políticas" y "Rutas" ahora se agrupan ordenadamente bajo el submenú "Backups".
- **Toggle de Contraseñas**: Implementado globalmente (Login, Registro, Edición de Credenciales) usando el estándar `slotProps` de React 19/MUI 9.

## 2. Inventario e Infraestructura
- **Wizard Único de Registro (`AddServerPage`)**: 
  - Se unificaron `AddServerPage` y el antiguo `PostRegisterWizard` en un único flujo continuo mediante un `Stepper` de 4 pasos.
  - **Mejora en Credenciales**: El formulario ahora detecta si se registra una base de datos y despliega campos para el motor (DBMS) y puerto.
  - **Inteligencia de Datos**: Autocompletado automático del puerto estándar según el motor seleccionado (MySQL -> 3306, Oracle -> 1521, etc.).
  - **Prueba de Conexión**: Implementación de lógica visual y funcional para el botón "Test Conexión" que apunta a endpoints dinámicos según el tipo de acceso.
- **Gestión de Servidores**: Se añadieron acciones directas de **Edición** y **Eliminación** en las tarjetas (`ServerCard`).
  - Creación de `UpdateServerInfoPage.tsx` para modificar datos existentes enviando solo los campos requeridos (PUT parcial).
- **Carga Masiva (`BulkUploadPage`)**: 
    - Actualización al endpoint `/servidores/import-bulk`.
    - Adaptación de la plantilla CSV (`infraestructura_template.csv`) y manual para soportar el registro de múltiples particiones e instancias de BD en una sola fila.
    - Actualización del kit de importación (.zip) con los nuevos estándares del backend.
- **Credenciales (`CredentialsPage`)**: Rediseñada al nuevo estándar, implementando filtros interactivos por Tipo de Acceso (SSH, DB, SFTP, API) y búsqueda en tiempo real.

## 3. Configuración del Servidor de Desarrollo
- Modificación en `vite.config.ts` para exponer el servidor (`host: '0.0.0.0'`, `allowedHosts: true`) y permitir acceso local desde otras IPs (ej. `148.215.4.110`).

---

### 🟢 ¿Dónde nos quedamos?
La arquitectura visual y de navegación ha sido completamente estandarizada. Los flujos principales de gestión de servidores y credenciales (CRUD completo) operan de manera fluida y con excelente UX (búsquedas en tiempo real, menús contraíbles, asistentes paso a paso).

### 🟡 ¿Qué falta por hacer?
- **Módulo de Backups**: Las opciones del menú ya están preparadas ("Políticas" y "Rutas"), falta construir estas vistas bajo el nuevo `UI_PATTERN.md`.
- **Monitoreo Real**: Conectar los indicadores mockeados de las tarjetas (`ServerCard`) con el endpoint de métricas reales de la API.
- **Auditoría**: Interfaz de consulta para la bitácora de eventos.

---
**Nota:** Cambios sincronizados en la rama `master`.
