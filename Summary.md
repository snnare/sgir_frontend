# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión para Continuar:** `SGIR-SESSION-2026-04-16-AR`

Este documento resume las implementaciones realizadas en la infraestructura del frontend para el Sistema de Gestión de Infraestructura y Respaldos (SGIR).

## 1. Núcleo de Autenticación y Seguridad
- **Servicios API (`src/api/authService.ts`)**: Implementación de Login (OAuth2 form-urlencoded), Registro, Obtención de Perfil (`/me`) y Logout.
- **Estado Global (`src/store/useAuthStore.ts`)**: Store de Zustand con persistencia automática (`auth-storage`). Maneja el token JWT, los datos del usuario y el estado de la sesión.
- **Protección de Rutas (`src/App.tsx`)**: 
    - `ProtectedRoute`: Bloquea acceso a rutas privadas si no hay sesión.
    - `PublicRoute`: Redirige al Home si un usuario logueado intenta entrar a Login/Register.
    - Validación automática de token al cargar la aplicación (`checkAuth`).

## 2. Comunicación y Manejo de Errores
- **Cliente Axios (`src/api/client.ts`)**: 
    - Interceptor de Peticiones: Inyecta `Authorization: Bearer <token>` automáticamente.
    - Interceptor de Respuestas: Captura errores globales (500, 403, 429, Network Errors) y los envía al sistema de notificaciones.
    - Timeout configurado a 10s.
- **Sistema de Notificaciones (`src/components/GlobalNotification.tsx`)**: Implementación de un Snackbar global con un store dedicado para mostrar alertas visuales (éxito, error, advertencia) desde cualquier parte del código.

## 3. Gestión de Perfil
- **Actualización de Datos (`src/components/ProfileDetails.tsx`)**: Refactorización completa para permitir la edición de nombres, apellidos y email. 
- **Validación**: Integración con `react-hook-form` y `Zod` para asegurar la integridad de los datos antes de enviarlos al backend.

## 4. Infraestructura Modular de API y Stores
Se ha creado una arquitectura escalable para los siguientes módulos, con sus respectivos servicios y stores de Zustand:
- **Roles**: `roleService.ts`, `useRoleStore.ts`.
- **Inventario Técnico**: `infrastructureService.ts`, `useInfrastructureStore.ts` (Servidores, Instancias, DBMS, Credenciales, Criticidad).
- **Estrategia de Respaldos**: `backupService.ts`, `useBackupStore.ts` (Políticas, Rutas, Historial).
- **Monitoreo Real-Time**: `monitoringService.ts`, `useMonitoringStore.ts` (Alertas, Métricas de S.O., MySQL 8 y MongoDB).
- **Bitácora de Auditoría**: `auditService.ts`, `useAuditStore.ts` (Logs globales, tipos de eventos).

## 5. Tipado y Esquemas (`src/api/types.ts`)
- Centralización de esquemas de Zod para todas las entidades del sistema, asegurando que cada respuesta del backend sea validada antes de ser procesada por la UI.

---
**Nota:** Todos los cambios han sido sincronizados en la rama `master` del repositorio remoto.
