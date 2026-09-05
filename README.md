# Calculadora de precios · Muse & Co

App para calcular el precio de servicios de uñas/estética a partir de:
insumos (reutilizables o descartables), gastos fijos del local, tarifa
por hora y un margen de ganancia extra.

## Cómo correrla en tu compu

```bash
npm install
npm run dev
```

Abrí la URL que te muestre la terminal (por defecto http://localhost:5173).

## Cómo generar la versión final para subir a un hosting

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para subir a Netlify, Vercel, GitHub Pages, etc.

## Estructura

- `src/App.jsx` — toda la calculadora.
- `src/main.jsx` — punto de entrada de React.
- `src/index.css` — Tailwind.
