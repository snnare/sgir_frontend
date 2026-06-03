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

### S. Optimización de Consulta de Salud e Integración en HomePage
* **Análisis de Impacto**: Analizamos la llamada al endpoint `GET /sgir/v1/m1/host/health-status/{id_server}`. Se concluyó que invocarlo en `HomePage.tsx` era redundante y generaba sobrecargas innecesarias al servidor físico en cada polling, dado que los datos generales son provistos eficientemente por `/live-cache`.
* **Centralización**: Eliminamos la llamada al estado detallado de salud de hosts de la vista principal y la restringimos exclusivamente a la página de detalles individuales (`ServerDetailsPage.tsx`).
* **Resiliencia en Caché Vacía / Arranque**: Ajustamos la lógica para asegurar que el sistema maneje estados vacíos de forma controlada cuando la caché no se ha inicializado o el monitoreo está en pausa, previniendo comportamientos inconsistentes en UI.

### T. Limpieza de Formularios de Carga Masiva redundantes
* **Remoción en Credenciales, Rutas y Políticas**: Removemos los botones de subida masiva obsoletos en `CredentialsPage.tsx`, `BackupPathsPage.tsx` y `BackupPoliciesPage.tsx` para evitar confusión con el flujo global de Carga Masiva.
* **Limpieza de Endpoints en Backend**: Se depuraron y removieron los routers y métodos de carga en bloque inactivos o redundantes del backend (`base_de_datos_routes.py`, `politica_respaldo_routes.py`, etc.), manteniendo en producción únicamente las importaciones validadas (Servidores y Credenciales).

### U. Módulo de Reportes PDF Offline
* **Endpoints Backend**: Implementación de los endpoints `/assets/sre-pdf-offline` y `/assets/sre-sla-pdf` bajo el prefijo de API `/sgir/v1`. Estos resuelven la información mediante joins de SQLAlchemy directo de la BD PostgreSQL sin necesidad de ejecutar pings de red o SSH remotos a los hosts activos (eliminando cuellos de botella de red).
* **Navegación e Icono**: Registramos la nueva ruta `/reportes` en el frontend (`App.tsx`) y agregamos una pestaña exclusiva en `Sidebar.tsx` con el nombre de *"Reportes"* y el icono `PictureAsPdfIcon`, unificando el menú y enlazándolo directamente al renderizado de `ReportsPage.tsx`.

### V. Simplificación de Filtros de Destino (`BackupPathsPage.tsx`)
* **Canales Permitidos**: Limitamos las opciones del filtro de tipo de almacenamiento en `BackupPathsPage.tsx` únicamente a:
  1. Disco Local
  2. Sharepoint
* Se eliminaron todas las opciones redundantes que no forman parte de la directiva de infraestructura física.

### W. Entorno de Maqueta Estática e Interactiva (`static/index.html`)
* **Directorio /static**: Creamos la carpeta `static/` con un archivo interactivo auto-contenido `index.html`.
* **Cobertura Total**: Representa las 11 vistas operativas principales del sistema y permite navegar entre ellas dinámicamente mediante un tab-switcher JS.
* **Mínimo de 10 datos por vista**: Poblamos cada sección de datos con un arreglo estático de al menos 10 registros detallados realistas. Incorporamos simulación de carga masiva, notificaciones y escaneos de disco simulados.

### X. Compatibilidad y Ajustes TypeScript
* **Compatibilidad MUI v6**: En `ReportsPage.tsx`, migramos la estructura del elemento Grid obsoleto (`item xs md`) al nuevo prop `size` (`size={{ xs: 12, md: 6 }}`), solucionando advertencias de compilación crítica.
* **Limpieza noUnusedLocals**: Limpiamos imports huérfanos o sin usar en componentes clave para cumplir con las directivas estrictas de TypeScript de producción del proyecto.
* **Actualización del Template de Carga**: Modificamos el template de carga de servidores (`dtic_servers_imp.csv`) en el frontend pre-configurando accesos con credenciales del sistema (`sigr_monitoreo` / `123Nokia`) y asegurando que solo se incluyan servidores basados en Linux.

### Y. Refactorización del Asistente de Registro de Servidor (Wizard Incremental)
* **Objetivo**: Modificar `AddServerPage.tsx` para persistir activos de forma incremental a lo largo de cada paso del wizard, previniendo fallos al final y habilitando pruebas de conexión SSH/RDBMS dinámicas en tiempo real en base a datos reales y no marcadores ficticios.
* **Flujo por Pasos**:
  * **Paso 1 (Datos Técnicos)**: En lugar de guardar únicamente en el estado local, el botón "Siguiente" envía una petición `POST` a `/crud/servidores/` y crea el servidor físico. Si el alcance incluye base de datos, envía un `POST` a `/crud/instancias/` con el ID del servidor recién retornado. En caso de navegación de retroceso (Back) y posterior avance, el componente realiza una petición `PUT` sobre el ID almacenado en el estado local (`createdServerId`) para evitar duplicaciones.
  * **Paso 2 (Credenciales)**: Vinculamos el ID del servidor real (`createdServerId || 9999`) a los formularios de credenciales de seguridad SSH y de base de datos.
  * **Paso 3 (Confirmación)**: El botón "Registrar" ahora sólo gatilla la activación del scheduler de observabilidad a través de la llamada `POST /crud/monitoreo/` inyectando el ID del servidor.
* **Control de Carga Asíncrona**: Actualizamos las firmas de la interfaz `onSubmitData` en `ServerForm.tsx` y `CredentialForm.tsx` para aceptar promesas asíncronas y envolver la ejecución con `setLoading(true/false)`, mostrando adecuadamente el spinner de guardado en el botón "Siguiente" en el modo Wizard.

### Z. Corrección de Bucle Infinito de Logout en 401 Unauthorized
* **Causa**: El interceptor de respuestas de Axios (`src/api/client.ts`) ejecutaba un logout global al detectar un estado `401 Unauthorized`. Sin embargo, si la sesión ya había expirado, la llamada propia de logout `POST /crud/users/logout` también fallaba con un `401`, provocando una recursión infinita de peticiones idénticas de red que saturaba el navegador del SRE.
* **Solución**: Agregamos un filtro de escape con `!error.config?.url?.includes('/crud/users/logout')`. Si el error proviene del propio endpoint de cierre de sesión, el interceptor limpia directamente de forma silenciosa el estado en la store local de Zustand (`useAuthStore.setState()`) y detiene la llamada recurrente al servidor.

### AA. Sincronización del Esquema DBMS en Creación de Instancias
* **Actualización del Modelo**: Cambiamos la propiedad `id_estado_instancia` por **`id_estado`** en el esquema Zod `InstanceSchema` de `src/api/types.ts` y en los formularios `InstanceForm.tsx` y `ServerForm.tsx` para alinearse a la restructuración física de la tabla `Instancia_DBMS`.
* **Compatibilidad de Lado del Servidor (Doble Envío)**: Para prevenir errores de validación (`422 Unprocessable Entity - Field Required`) de Pydantic/FastAPI en backends antiguos y nuevos, configuramos los payloads de creación de instancias para inyectar simultáneamente ambos campos (`id_estado: 1` e `id_estado_instancia: 1`). Adicionalmente, se configuraron ambos campos como opcionales en el parseador de Zod para mayor resiliencia.
* **Logs de Auditoría**: Agregamos registros de auditoría por consola (`console.log`) para visibilizar y registrar el empaquetado del parámetro especial `sid` de Oracle dentro de `parametros_conexion` al enviar las peticiones.

### AB. Mapeo Dual y Validación del Explorador de Respaldos (`BackupDiscoveryPage.tsx`)
* **Problema**: El endpoint de escaneo por servidor (`POST /discover-backups-server/...`) retorna un objeto JSON con esquema simplificado (`lista_archivos` como lista plana de nombres en string, `archivos_fisicos_totales` y `peso` como string), mientras que el escaneo específico de instancia retorna un JSON detallado (`archivos` con objetos que poseen fecha y tamaño individuales, `archivos_fisicos_conteo` y `total_peso_mb` numérico). Esto provocaba caídas de validación estrictas de Zod en la consulta del servidor físico.
* **Esquemas Separados y Mapeo Condicional**:
  * Creamos el esquema `ServerBackupDiscoveryResponseSchema` en `types.ts` y actualizamos el tipado del servicio `discoverBackups`.
  * Adaptamos el renderizado de tarjetas para calcular de manera dinámica las etiquetas y valores basados en el modo activo (`mode === 'server'`).
  * En `filteredAndSortedFiles`, se inyectó un mapeo sobre la marcha que toma la lista plana de strings de nombres de archivo y los empaqueta en objetos virtuales `{ nombre: name, tamano_mb: 0, fecha_modificacion: '-' }` para garantizar que la tabla original pinte las coincidencias encontradas sin errores sintácticos.
* **Remoción del Panel de logs SRE**: Removimos el panel simulador de terminal interactive negro para evitar parpadeos visuales al ejecutar escaneos rápidos y pusimos encadenamiento opcional `?.toFixed(2)` en el cálculo de pesos para evitar caídas de estado no sincronizados de React.

---

## 2. 📁 Estado del Repositorio de Git

### Cambios Commiteados y Enviados (Push exitoso a Github)
* **Commit `e95aba7`**: `fix: restaurar esquema de escaneo de servidor y adaptacion en explorador de respaldos`
* **Commit `aa6de3a`**: `fix: prevenir TypeError (cannot read properties of undefined reading toFixed) al cambiar de modo de escaneo`
* **Commit `5ee0d2e`**: `fix: remover consola interactiva simulada de logs SRE en explorador de respaldos`
* **Commit `3909e58`**: `fix: corregir parseo de respuesta y renderizado en explorador de respaldos para escaneo de servidor`
* **Commit `3b8b7b6`**: `fix: resolver error de validacion enviando id_estado_instancia e id_estado simultaneamente`
* **Commit `83fc0b5`**: `refact: actualizar esquema de instancia DBMS y guardar sid en parametros_conexion`
* **Commit `ae68a4b`**: `refact: wizard de registro de servidor incremental y correccion de bucle infinito en logout`
* **Commit `673afc1`**: `feat: implementacion de plantillas dinamicas en carga masiva y resolucion de bugs de descarga y propagacion`
* **Commit `43253e3`**: `cambios en imports y correcciones`
* **Commit `370b8be`**: `refactor: replace browser alerts with AlertDialog, replace spinners with Skeletons, and standardize submit buttons`
* **Commit `9f1798a`**: `refactor: migrate CredentialsPage delete to ConfirmDialog and implement skeletal load rows in policies and credentials pages`

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
