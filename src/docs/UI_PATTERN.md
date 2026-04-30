# Patrón de Diseño de Páginas - SGIR

Este documento define la estructura estándar para las páginas principales de los módulos (Dashboard, Backups, Auditoría, etc.) para mantener la consistencia visual en todo el sistema.

## Estructura de la Página (Layout)

Las páginas deben seguir este orden descendente:

### 1. Encabezado (Header)
- **Título (`h3`):** El nombre del módulo o acción principal (ej. "Panel de Control", "Gestión de Backups").
- **Descripción (`body1`):** Una breve frase descriptiva del propósito de la página en color `text.secondary`.
- **Margen inferior:** `mb: 4`.

### 2. Resumen de Métricas (Métricas de KPI)
- Un contenedor `Box` con `display: grid`.
- Columnas: `{ xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }`.
- Componente: `MetricCard`.
- Propósito: Mostrar datos agregados rápidos (Total, Salud, Alertas).
- **Margen inferior:** `mb: 6`.

### 3. Barra de Acciones y Filtros (Control Bar)
Un `Paper` (elevation 0) con fondo `background.paper` o `action.hover` y borde sutil.
- **Fila Superior:**
    - Buscador (`TextField` con `SearchIcon`).
    - Botones de acción principales (ej. "Carga Masiva", "Nuevo").
- **Fila Inferior (Separada por un `Divider` dashed):**
    - Chips de filtrado por estado.
    - Contador de resultados visibles.
- **Margen inferior:** `mb: 5`.

### 4. Listado de Datos (Main Content)
- Título de sección opcional con icono.
- Lista de tarjetas (`ServerCard`, `BackupCard`, etc.) dentro de un `Stack` con `spacing: 3`.
- Estado vacío (`Empty State`) consistente con icono de `48px`, título `h6` y descripción centrada.

## Animación
Todas las páginas deben estar envueltas en un `Box` con la animación `fadeIn`:
```tsx
<Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
  ...
</Box>
```

## Paleta de Colores Técnicos
- **Éxito:** `#22c55e` (Verde)
- **Advertencia:** `#f59e0b` (Ámbar)
- **Crítico:** `#ef4444` (Rojo)
- **Primario:** Basado en el `text.primary` del tema (Zinc 900 o 50).
