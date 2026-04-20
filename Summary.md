# Resumen de Cambios - Proyecto SGIR Frontend

**ID de Sesión para Continuar:** `SGIR-SESSION-2026-04-19-AR`

Este documento resume las implementaciones realizadas en la infraestructura del frontend para el Sistema de Gestión de Infraestructura y Respaldos (SGIR).

## 1. Núcleo de Autenticación y Perfil
- **Sesión Extendida**: Implementación de la funcionalidad "Recuérdame" en el Login, permitiendo extender la validez del token a 7 días mediante query parameters en la API.
- **Gestión de Perfil (`ProfilePage.tsx`)**: Implementación completa de la visualización y edición de datos del usuario, incluyendo el mapeo dinámico de roles desde el backend.
- **Seguridad**: Integración de la ruta de perfil dentro del sistema de rutas protegidas y el layout del dashboard.

## 2. Flujo de Registro y Configuración Proactiva
- **Setup Wizard (`PostRegisterWizard.tsx`)**: Nuevo flujo guiado que se activa automáticamente tras registrar un servidor. Permite al usuario:
    - Seleccionar el alcance del monitoreo (Básico, BD o Completo).
    - Recibir recomendaciones técnicas de seguridad según el tipo de acceso.
    - Vincular credenciales (SSH/DB) inmediatamente al servidor recién creado.
- **Servicios de Credenciales**: Implementación de `createCredential` (POST /credenciales/) con validación estricta de esquemas Zod.

## 3. Visualización de Infraestructura y Monitoreo
- **Componente `ServerCard.tsx`**: Nueva tarjeta técnica para servidores que muestra:
    - Estado de conexión con animación de pulso (Online/Offline/Warning).
    - Desglose de recursos (CPU, RAM, Disco) mediante el componente modular `MetricCard`.
    - Sección preparada para métricas específicas de Motores de Base de Datos.
- **Panel de Control Dinámico**: La `HomePage.tsx` ahora muestra indicadores de inventario (Total nodos, Online, Alertas) y lista todos los servidores activos consultando la API en tiempo real.

## 4. Experiencia de Usuario (UI/UX)
- **Modo Oscuro/Claro**: Integración de un interruptor de tema en el Sidebar con persistencia en el `useThemeStore`.
- **Carga Masiva**: Creación de la interfaz `BulkUploadPage.tsx` preparada para la importación de archivos CSV.
- **Mejoras Estéticas**: Refactorización de botones, espaciados en el perfil y transiciones suaves para una sensación de aplicación moderna y técnica.

---

### 🟢 ¿Dónde nos quedamos?
El flujo de inventario está cerrado: desde el alta de un servidor hasta su configuración técnica de acceso. El dashboard ya es capaz de listar la flota de servidores y mostrar su estado general.

### 🟡 ¿Qué falta?
- **Lógica de Carga Masiva**: Implementar el procesamiento del archivo CSV y el envío por lotes a la API.
- **Monitoreo Real**: Sustituir los datos simulados (mocks) de las tarjetas por peticiones al servicio de monitoreo/métricas.
- **Módulo de Backups**: Implementar las vistas para políticas y rutas de respaldo.
- **Auditoría**: Crear la interfaz para consultar la bitácora de eventos del sistema.

### 🚀 Mejoras Sugeridas
- **Real-time**: Implementar polling o WebSockets para que las métricas de los servidores se actualicen sin recargar la página.
- **Gráficos**: Añadir mini-gráficos de tendencia (sparklines) en las tarjetas de servidor para ver el comportamiento de los últimos 10 minutos.
- **RBAC**: Ocultar secciones del Sidebar (como Carga Masiva o Configuración) basándose en el nivel del rol del usuario actual.

---
**Nota:** Todos los cambios han sido sincronizados en la rama `master` del repositorio remoto mediante el proceso automatizado de Git.
