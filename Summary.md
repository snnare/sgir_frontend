# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión para Continuar:** `SGIR-SESSION-2026-04-17-AR`

Este documento resume las implementaciones realizadas en la infraestructura del frontend para el Sistema de Gestión de Infraestructura y Respaldos (SGIR).

## 1. Núcleo de Autenticación y Seguridad
- **Servicios API (`src/api/authService.ts`)**: Implementación de Login (OAuth2), Registro, Obtención de Perfil (`/me`) y Logout.
- **Estado Global (`src/store/useAuthStore.ts`)**: Store de Zustand con persistencia. 
- **Optimización de Sesión**: Se mejoró `checkAuth` para utilizar datos persistidos en recargas, eliminando llamadas redundantes a la API y acelerando el arranque de la aplicación.
- **Flujo de Cierre de Sesión**: Integración completa del Logout en el Sidebar, asegurando la limpieza de tokens tanto en el cliente como en el servidor.

## 2. Gestión de Inventario (Servidores)
- **Registro de Servidores**: Implementación del formulario `ServerForm.tsx` con soporte para:
    - Validación de IP v4 mediante Regex.
    - Parámetro `es_legacy` con Tooltips informativos.
    - Generación automática de `fecha_registro` (now).
- **Verificación de IP en Tiempo Real**: Funcionalidad de botón "Check" que consulta el endpoint `/servidores/{ip}` para validar disponibilidad antes del registro, con notificaciones visuales inteligentes.
- **Manejo de Errores Técnicos**: Implementación de depuración avanzada para errores 422 (FastAPI), mostrando al usuario exactamente qué campo falló en la validación del servidor.

## 3. Arquitectura de Componentes Modulares
Se han creado selectores inteligentes y reutilizables que gestionan su propio estado y carga de datos:
- **`CriticalitySelect.tsx`**: Selector de nivel de criticidad que consume datos dinámicos de la base de datos.
- **`StatusSelect.tsx`**: Selector de estado general con capacidad de filtrado por IDs (ej. solo mostrar 'Activo' e 'Inactivo' para servidores).
- **Sistema de Caché**: Ambos componentes utilizan el `useInfrastructureStore` para cachear los metadatos, evitando peticiones repetitivas al navegar entre páginas.

## 4. Infraestructura de API y Stores
- **Actualización de Endpoints**: Estandarización de rutas hacia `/servidores/` y `/estados/`.
- **Zustand Store (`useInfrastructureStore.ts`)**: Centralización de servidores, instancias, DBMS, criticidades y estados con lógica de carga optimizada.

## 5. Tipado y Esquemas (`src/api/types.ts`)
- Evolución de los esquemas de Zod para soportar la creación de servidores, incluyendo validaciones estrictas y tipado para las respuestas de verificación de IP.

---
**Nota:** Todos los cambios han sido sincronizados en la rama `master` del repositorio remoto mediante Git.