# mis-gastos

App móvil de seguimiento de gastos e ingresos personales. Diseñada para usarse desde el celular (max-width 480px).

## Stack

- **React 19** + **Vite 8** (JSX, sin TypeScript)
- **localStorage** para persistencia (clave por mes: `mov-YYYY-MM`)
- Estilos 100% inline con objeto `COLORS` centralizado — sin CSS modules ni Tailwind
- Fuente: Space Grotesk (Google Fonts, cargada en `index.css`)

## Estructura

```
src/
├── constants.js        colores, categorías, nombres de meses
├── utils.js            funciones puras (fechas, formato, etiquetas)
├── storage.js          cargarMes / guardarMes / probarAlmacen (localStorage)
├── GastosApp.jsx       estado global + handlers (orquestador)
├── App.jsx             solo monta <GastosApp />
└── components/
    ├── Header.jsx      título + navegación ‹ mes ›
    ├── FormRegistrar.jsx  tipo, teclado numérico, categorías, fecha/nota
    ├── Resumen.jsx     balance + barras por categoría + exportar CSV
    ├── Historial.jsx   lista de movimientos con editar/eliminar
    ├── NavBar.jsx      barra inferior fija (Registrar / Resumen / Historial)
    ├── Toast.jsx       notificación flotante temporal
    ├── ModalCSV.jsx    modal de exportación
    └── ModalError.jsx  modal de error de almacenamiento
```

## Convenciones

- Todo el estado vive en `GastosApp.jsx`; los componentes solo reciben props
- No usar `async/await` en funciones de storage (localStorage es síncrono)
- Las categorías y colores se editan únicamente en `constants.js`
- Al agregar una categoría nueva, agregarla en `CATEGORIAS_GASTO` o `CATEGORIAS_INGRESO`
- No instalar librerías de UI — los estilos inline son intencionales para mantener el bundle mínimo
