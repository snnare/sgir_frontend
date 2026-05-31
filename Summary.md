# 📋 Resumen Consolidado de Desarrollo (SGIR Frontend)

Este documento sirve como bitácora detallada de todo el trabajo técnico y visual realizado en el proyecto `sgir_frontend`, registrando el estado del repositorio, las arquitecturas de componentes implementadas y el mapa de ruta con los siguientes pasos para reanudar esta conversación sin pérdida de contexto.

---

## 1. 🚀 Logros y Cambios Implementados

### A. Endpoint de Rutas Detalladas e Integración (`BackupPathsPage.tsx`)
* **Endpoint Conectado**: `GET /sgir/v1/crud/rutas-respaldo/details` (vía `getBackupPathsDetails` en `backupService.ts`).
* **Rediseño Completo de la Tabla**:
  * Diseñamos una rejilla de control premium de 5 columnas enfocadas en SRE.
  * **Servidor (IP)**: Alineación izquierda con tipografía monospace (`fontFamily: '"JetBrains Mono", monospace'`) y acompañada del ícono `DnsIcon` en el color primario de acento.
  * **Ruta Física (Mount Point)**: Encapsulada dentro de un bloque discreto de estilo de código (`bgcolor: 'action.hover'`, padding refinado) para legibilidad inmediata del punto de montaje en Linux.
  * **Descripción / Alias**: Texto de alto contraste con jerarquía tipográfica limpia.
  * **Estado**: Chip dinámico redondeado coloreado según la conectividad (`success` para "Activo" o "Disponible", `default` para inactivos).
* **Filtros e Integración Cruzada**: Cruzamos en tiempo real la información detallada obtenida de la API con los datos base de la store de respaldos (`paths` de `useBackupStore`). Esto permite que el selector visual **`FilterBar`** filtre con precisión por tipo de almacenamiento (Disco Local, NAS/NFS, Cloud Storage, Amazon S3) de forma client-side a pesar de que el JSON del endpoint `/details` no exponga originalmente el identificador de almacenamiento.
* **Resiliencia de Demostración**: Implementamos el objeto `TEST_PATHS_DETAILS` con la estructura exacta del backend para actuar como fallback. Si la base de datos está vacía, el SRE visualiza de inmediato un entorno simulado de alta fidelidad.

### B. Edición Robusta de Destinos (`EditBackupPathPage.tsx`)
* **Mapeo de Rutas**: Conectado a la ruta `/edit-path/:id` y renderizado bajo `FormPageLayout` que provee el encabezado dual de navegación (Home y Volver) en diseño squircle de Material UI.
* **Resiliencia ante Mocks**: Añadimos el array `TEST_PATHS` como fallback local. Si el usuario intenta editar una ruta simulada (ID `201` o `202`), el formulario carga los campos y pre-rellena el formulario correctamente en lugar de dar pantallas en blanco.
* **Garantía ante IDs Inexistentes**: Si el parámetro ID en la URL es inválido o no existe en el backend ni en los mocks locales, el componente despliega un ícono gráfico de advertencia (`WarningAmberIcon`), un texto descriptivo y un botón unificado de redirección al listado.

### C. Arquitectura Global de Avisos Modales (`AlertDialog`)
* **Dificultad Detectada**: El proyecto dependía del uso de cajas grises `alert()` nativas del navegador, lo cual restaba calidad y consistencia estética a la interfaz.
* **Zustand Store (`src/store/useAlertStore.ts`)**: Creado para manejar de forma global y atómica ventanas modales de alerta única (bloqueantes con un único botón de confirmación), permitiendo configurar el estado abierto, títulos, descripciones de error detalladas, textos de botones personalizados (`buttonLabel`) y callbacks de descarte (`onClose`).
* **Visual Component (`src/components/AlertDialog.tsx`)**: Un modal premium que soporta 4 severidades y sus correspondientes colores y vectores semánticos:
  * `info`: `InfoIcon` de color azul.
  * `success`: `CheckCircleIcon` de color verde.
  * `warning`: `ReportProblemIcon` de color ámbar.
  * `error`: `ErrorIcon` de color rojo.
* **Montaje**: Integrado globalmente en el árbol raíz en `src/App.tsx` junto con `ConfirmDialog` y `GlobalNotification`.
* **Migración**: 
  * Reemplazamos todos los `alert()` nativos en la página de políticas de respaldo (`BackupPoliciesDetailsPage.tsx`).
  * Reemplazamos todos los `alert()` nativos en la página de servidor (`ServerDetailsPage.tsx`) ante fallas de diagnóstico o inicialización de observabilidad.
  * Consolidamos los manejadores de excepciones en la sincronización de inventario (`SearchAssetsPage.tsx`) y carga en lote (`BulkUploadPage.tsx`) para desplegar este nuevo y elegante aviso.

### D. Planificador Rápido - Visual Cron Builder (`BackupPolicyForm.tsx`)
* **Problema**: La creación o edición de políticas obligaba a los SRE a escribir expresiones Cron manuales (ej: `0 4 * * 1-5`), lo cual es propenso a fallos sintácticos graves en entornos automatizados.
* **Selector Visual**: Agregamos un dropdown de preselección con presets comunes:
  * **Diario**: Genera `0 0 * * *` (Cada medianoche).
  * **Semanal**: Genera `0 0 * * 0` (Domingos medianoche).
  * **Mensual**: Genera `0 0 1 * *` (Día 1 de cada mes).
  * **Cada hora**: Genera `0 * * * *` (Minuto 0 de cada hora).
  * **Personalizado (Manual)**: Permite ingresar cualquier expresión personalizada.
* **Enclavamiento Seguro**: Al elegir cualquiera de las opciones rápidas, el campo de texto de la expresión Cron se completa automáticamente y se coloca en estado **deshabilitado / solo lectura** para evitar alteraciones accidentales. Si el usuario escoge "Personalizado", el campo se desbloquea.

### E. Test de Conexión en Edición de Credenciales (`EditCredentialPage.tsx`)
* **Acción Inline**: Implementamos el botón `"Test Conexión"` en formato outlined directamente en la barra de acciones del formulario de edición.
* **Resolución Inteligente de Infraestructura**:
  * Al hacer clic, el componente valida si el tipo de acceso es SSH (1) o DB Native (2).
  * Para accesos DB Native, consulta en segundo plano mediante `getInstancesByServer` las bases de datos montadas en el servidor asociado.
  * Obtiene de forma dinámica el primer motor de base de datos instalado (ej: Oracle) y cruza los catálogos de DBMS locales para estructurar la ruta exacta del endpoint (ej: `oracle/no-legacy`), inyectando el SID del motor y realizando la prueba de conectividad hacia el backend de forma automática y transparente.

### F. Transiciones Orgánicas de Carga (`Skeletons`)
* Para erradicar la percepción de bloqueos en la interfaz y eliminar el uso de indicadores circulares estáticos (`CircularProgress`), desarrollamos plantillas esqueléticas (`Skeleton` de Material-UI) que replican de forma fiel la estructura geométrica de cada vista en carga:
* **Layouts de Tabla**: Implementados en `BackupPathsPage.tsx`, `CredentialsPage.tsx` y `SearchAssetsPage.tsx`, dibujando cabeceras y 4 filas simuladas con stacks de botones redondeados.
* **Layouts de Tarjeta / Métrica**: Diseñados en `HomePage.tsx` y `BackupPoliciesPage.tsx`, proyectando rectángulos de KPIs fijos y grillas adaptables de 4 columnas para emular los paneles del Dashboard.
* **Layouts de Formulario**: Integrados en `EditBackupPathPage.tsx`, `EditBackupPolicyPage.tsx`, `EditCredentialPage.tsx` y `UpdateServerInfoPage`.

### G. Estandarización de Botones a "Guardar"
* Modificamos todos los botones principales de envío en los formularios editables del sistema (`BackupPathForm`, `BackupPolicyForm`, `EditCredentialPage`, `UpdateServerInfoPage`) para utilizar la etiqueta única y simplificada de **`"Guardar"`** (y **`"Procesando..."`** al guardar), homogeneizando el contraste con la paleta tipográfica y sombras del proyecto.

### H. Carga Masiva Global y Kit Completo Unificado
* **Enrutamiento por Defecto**: Rediseñamos el comportamiento inicial de `/bulk-upload`. Si el usuario ingresa a la URL limpia sin query parameters (`?type=...`), el componente ahora inicializa por defecto la interfaz de **Carga Masiva Global (Kit Completo)**, ofreciendo una experiencia centralizada de descarga y administración.
* **Diccionario de Configuraciones**: Agregamos la configuración `completo` al mapeo dinámico de `BulkUploadPage.tsx`, la cual integra descargas específicas, descripciones orientadas a la inicialización global del sistema y simulaciones de alta fidelidad.

### I. Empaquetado de Plantillas Planas (Solo Guía + CSV)
* **Estructura sin Carpetas**: Re-diseñamos el empaquetado de todos los archivos `.zip` en `public/templates/` utilizando la bandera `-j` de `zip` para descartar subcarpetas. Al extraerse, los recursos (la guía `.md` leída desde el recién renombrado directorio `guias/` y el `.csv` de `plantillas/`) se extraen directamente en la raíz de la descarga sin crear subcarpetas, garantizando un desempaquetado limpio y directo ("guia + csv" únicamente).
* **Kit Completo Plano**: Compilamos `kit_completo.zip` unificando las 6 guías y plantillas CSV en formato plano directamente en su raíz.

### J. Resoluciones de Bugs Operativos en Carga Masiva
* **Bypass de React Router en Descargas**: Sustituimos el evento de clic con `window.open` del botón de descarga por un componente ancla nativo (`component="a"`, `href` y `download`). Esto fuerza al navegador a ejecutar la descarga en segundo plano y evita que React Router intercepte la URL y redirija erróneamente al SRE a la página principal (`HomePage.tsx`).
* **Bloqueo de Burbujeo de Eventos (Event Bubbling)**: Inyectamos `e.stopPropagation()` en el botón de descarga del CSV para prevenir que el evento de clic propague hacia el componente `<Paper>` padre (el cual tiene asignada la apertura del explorador de carga), eliminando el molesto comportamiento que desplegaba la selección de archivos locales al presionar el botón de descarga.

### K. Integraciones y Refactorizaciones en la Barra Lateral (Sidebar)
* **Acceso Global a Carga Masiva**: Agregamos una nueva opción permanente `Carga Masiva` en el pie de página (*Footer*) del Sidebar (abajo de Perfil y antes del divider) utilizando el icono `CloudUploadIcon`, permitiendo una navegación reactiva hacia `/bulk-upload` en cualquier momento.
* **Mejora de Iconografía SRE**: Sustituimos el icono genérico de subida de la carpeta `"Respaldos"` por **`SettingsBackupRestoreIcon`**, alineándose perfectamente con la semántica operativa de programación, retención e historial de respaldos.

### L. Doble Vista en Inventario y Buscador Profundo (`SearchAssetsPage.tsx`)
* **Doble Visualización (Detallada vs. Comprimida)**: Alterna entre ver cada BD de forma individualizada (con IP de servidor abajo) o agrupada por host e instancia RDBMS (con conteo total de esquemas, motor y peso total sumado en MB/GB).
  * **Vista Detallada**: Cada base de datos representa una fila en la tabla, reordenado con la columna `Servidor / IP` en primer lugar, mostrando la **IP en negritas y formato monoespaciado** y el nombre del Host en la parte inferior.
  * **Vista Comprimida**: Agrupa reactivamente los activos por Host e Instancia DBMS, realizando agregación computada del conteo de bases de datos internas y el peso total acumulado en megabytes/gigabytes. Muestra la estampa temporal de la última sincronización (`lastSyncTime`) de forma dinámica.
* **Búsqueda Bidireccional Profunda**: Modificamos el algoritmo de búsqueda de la vista comprimida. Ahora inspecciona recursivamente la lista interna de bases de datos (`bases_de_datos.some(...)`) de cada instancia, permitiendo al SRE encontrar inmediatamente el Host que hospeda un esquema particular digitando sólo su nombre en el buscador general.

### M. Descarga de Reportes CSV/PDF con Inyección JWT (`SearchAssetsPage.tsx`)
* **Integración de Reportes**: Transformamos el botón de Reportes en un menú desplegable interactivo (`DownloadIcon` + `KeyboardArrowDownIcon`) con dos opciones:
  * **PDF (UAEMex)**: Primera opción, asociada a `PictureAsPdfIcon` y subtítulo *"A4 UAEMex"*.
  * **Crudo (CSV)**: Segunda opción, asociada a `StorageIcon` y subtítulo *"Excel"*.
* **Descarga Autenticada con Blob**: Ambos botones ejecutan peticiones Axios del lado del cliente (`api.get` con `responseType: 'blob'`), inyectando de forma segura y automatizada el token Bearer JWT activo del usuario. Al resolverse, gatilla una descarga binaria nativa en el navegador con un nombre de archivo dinámico basado en la fecha (ej. `reporte_activos_YYYY-MM-DD.pdf`).

### N. Importador Rápido de Crontab en Alta de Políticas (`BackupPolicyForm.tsx`)
* **Importación Directa**: Añadimos el nuevo campo de texto **"Expresión Crontab de Importación Rápida"** inmediatamente después de la Descripción en el alta y edición de políticas.
* **Parser y Saneamiento**: Desarrollamos un algoritmo inteligente en frontend que analiza la expresión crontab (soportando formato estándar de 5 campos y formato corto de 4/3 campos + comando). Al pegar la línea, rellena de forma reactiva y en tiempo real:
  * **Expresión Cron** y sincroniza el selector de Planificación Rápida.
  * **Ruta del Script** de respaldo.
  * **Hora de Ejecución** (convirtiendo valores al formato estándar `HH:MM:SS`, ej. `04:00:00`).
  * **Días de la semana** de ejecución.
  * **Frecuencia** en horas estimada del crontab.
* **Solución al Overlapping de Labels (MUI)**: Integramos la suscripción reactiva mediante `watch()` de React Hook Form y aplicamos `InputLabelProps={{ shrink: true }}` de forma permanente en todos los campos autocompletados. Esto asegura que la etiqueta de los TextFields se mantenga flotando perfectamente en el borde superior, evitando solapamientos estéticos con placeholders o datos importados.

### O. Endpoints de Credenciales y Fallback Ultra-Resiliente Client-Side
* **Endpoint de Lectura Backend**: Implementamos el endpoint faltante `GET /crud/credenciales/{credencial_id}` en el router del backend (`credencial_acceso_routes.py`) utilizando la función interna `get_credencial`.
* **Saneamiento de Valores MUI Select**: Rellenamos `defaultValues` atómicos y seguros (`''` como fallback para valores numéricos opcionales) en `useForm` de `EditCredentialPage.tsx` para evitar que la UI renderice con valores `undefined` que disparaban warnings críticos en los dropdowns de Material UI.
* **Resiliencia de Red en Edición**: Ante la imposibilidad de forzar el reinicio de contenedores Docker en tiempo de ejecución en caliente (evitando downtime), diseñamos un **mecanismo de fallback inteligente en el frontend** (`getCredentialById` en `infrastructureService.ts`). Si la petición directa al ID retorna un error `405` o `404` por falta de refresco en la memoria del contenedor, el helper consulta instantáneamente el listado completo indexado (`getCredentials()`), filtra el ID y lo mapea al esquema plano requerido, logrando un funcionamiento 100% libre de interrupciones.

### P. Prevención de Bucles de Renderizado (Zustand v5 useShallow)
* **El Problema**: Las vistas principales (`Sidebar.tsx`, `HomePage.tsx`, `ServerDetailsPage.tsx`) importaban stores de Zustand completos mediante destructuración de objetos (`const { ... } = useMonitoringStore()`), lo que provocaba re-renderizados incesantes de la interfaz cada vez que se actualizaban métricas en segundo plano.
* **Selector-Based Querying**: Refactorizamos todos los hooks de consulta para utilizar la función **`useShallow`** de Zustand v5. Los componentes ahora permanecen completamente estáticos y únicamente re-renderizan si cambian las propiedades visuales que consumen directamente.
* **Memoización de Componentes Loop (`React.memo`)**: Envolvimos la renderización de la tarjeta de servidor (`ServerCard.tsx`) con la función `memo` de React, aislando su ciclo de vida y reduciendo a cero los re-renderizados repetitivos al procesar colecciones masivas de nodos en el panel.

### Q. Control de Concurrencia de Red (Batched Fallback Polling)
* **El Problema**: Ante una caché vacía en el backend, la store ejecutaba consultas de salud `getHealthStatus()` en paralelo para cada servidor registrado a través de un `Promise.all` descontrolado. Al superar los límites de conexión de los navegadores (máximo 6 HTTP concurrentes), las peticiones entraban en cola, paralizando la navegación de la app.
* **Procesamiento por Lotes (Batching)**: Modificamos `fetchLiveCache` en `useMonitoringStore.ts` para procesar el fallback de servidores en **lotes controlados de 4 peticiones simultáneas**, introduciendo una pausa controlada de `100ms` entre cada lote. Esto mantiene el pool de conexiones del navegador libre en todo momento para solicitudes de usuario.

### R. Resolución de Bucle de Peticiones Infinitas (`ServerDetailsPage.tsx`)
* **Loop de Dependencias Solucionado**: Identificamos que el callback `loadServerData` incluía el objeto de métricas `dbLiveMetricsUnified` dentro de su array de dependencias. Al actualizarse las métricas, la función se regeneraba, disparando el `useEffect` de carga de forma recursiva e infinita.
* **Lectura Desacoplada**: Desacoplamos la dependencia leyendo el estado instantáneo de la memoria caché mediante `useMonitoringStore.getState().dbLiveMetricsUnified` dentro del cuerpo de la función, eliminando el loop de red y reduciendo el tráfico del servidor UAEMex.

### S. Cancelación de Operaciones SSH en Segundo Plano (`AbortController`)
* **Fuga de Recursos**: Al entrar a la sección de discos (`DiskManager.tsx`), se iniciaba un escaneo físico remoto vía SSH (`df -h`). Si el SRE salía de la pantalla antes de terminar, la petición seguía su curso en el browser y el backend, desperdiciando CPU del servidor.
* **Control de Cancelación**: Inyectamos el soporte de `AbortSignal` en `discoverFilesystems` (`infrastructureService.ts`) y configuramos un `AbortController` en el ciclo de desmontado del hook `useEffect` en `DiskManager.tsx`. Al salir de la vista, la llamada Axios es **abortada instantáneamente**, liberando sockets del pool del cliente y cancelando la tarea en el backend.

---

## 2. 📁 Estado del Repositorio de Git

### Cambios Commiteados y Enviados (Push exitoso a Github)
* **Commit `673afc1`**: `feat: implementacion de plantillas dinamicas en carga masiva y resolucion de bugs de descarga y propagacion`
* **Commit `43253e3`**: `cambios en imports y correcciones`
* **Commit `370b8be`**: `refactor: replace browser alerts with AlertDialog, replace spinners with Skeletons, and standardize submit buttons`
* **Commit `9f1798a`**: `refactor: migrate CredentialsPage delete to ConfirmDialog and implement skeletal load rows in policies and credentials pages`

### Cambios Locales en Working Directory (Staged / Uncommitted - Listo para la siguiente sesión)
Los siguientes archivos han sido modificados, completamente validados a nivel de tipo (`pnpm tsc --noEmit` exitoso) y empaquetados en producción (`pnpm run build` exitoso), pero **NO han sido commiteados ni enviados a Git**, según las instrucciones:
1. `src/components/Sidebar.tsx` (Selector optimizations y useShallow).
2. `src/pages/HomePage.tsx` (Selectors y useShallow en Zustand stores).
3. `src/components/ServerCard.tsx` (Componente memoizado React.memo y selectores optimizados).
4. `src/pages/ServerDetailsPage.tsx` (useShallow, remoción del bucle infinito de dbLiveMetricsUnified, llavero de credenciales con redirección rápida).
5. `src/store/useMonitoringStore.ts` (Fallback de health individual procesado en lotes de 4 con 100ms de retraso).
6. `src/api/infrastructureService.ts` (Fallback ultra-resiliente client-side en getCredentialById y soporte de AbortSignal en discoverFilesystems).
7. `src/components/DiskManager.tsx` (AbortController para cancelar peticiones SSH en background en desmontaje de la vista).
8. `sgir_backend/app/routes/core_crud/infrastructure/credencial_acceso_routes.py` (Endpoint backend GET /crud/credenciales/{id} implementado).
9. `README.md` (Documentación actualizada).
10. `Summary.md` (Bitácora consolidada de desarrollo actualizada).

---

## 3. 📝 Mapa de Ruta: Qué Falta y Qué Mejorar (Siguiente Sesión)

Para continuar evolucionando la calidad y cobertura técnica del frontend de SGIR, se proponen los siguientes puntos de acción para futuras conversaciones:

### A. Funcionalidad Pendiente (Qué Falta)
1. **Validación Sintáctica Preventiva en Carga Masiva (`BulkUploadPage.tsx`)**:
   * Desarrollar un validador sintáctico del lado del cliente que verifique la estructura del archivo CSV/JSON (ej: IPs repetidas, rutas relativas mal formadas, campos requeridos faltantes) y dibuje una tabla con marcas de alerta *antes* de subir el archivo al servidor.
2. **Historial de Respaldos e Integridad de Logs**:
   * Ampliar la vista de detalles de políticas (`BackupPoliciesDetailsPage.tsx`) para listar de forma tabular el historial de ejecuciones reales (éxitos vs fallos) con descargas directas de los scripts de salida y auditorías de SRE.

### B. Opciones de Mejora en Deuda Técnica y Usabilidad (Qué Mejorar)
1. **Generalización de Componentes de Esqueleto**:
   * Crear un componente contenedor unificado `SkeletalLayout` para evitar repetir el diseño de stacks de `Skeleton` en las páginas de formulario de edición.
2. **Caché en Zustand para Datos de Inventario**:
   * En `SearchAssetsPage.tsx`, cada vez que se navega, se realiza una recarga forzada (`setLoading(true)`). Implementar un almacenamiento de caché con temporizador en la store de monitoreo evitaría recargas repetitivas y aceleraría la velocidad percibida.
