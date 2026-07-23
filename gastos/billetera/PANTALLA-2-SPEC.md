# Pantalla 2 — Sheet del FAB (carga rápida de transacción)

Spec para construir en Figma, sobre el mismo archivo `UX1` (frame nuevo "Sheet carga"),
reusando los tokens ya definidos en el frame "Dashboard" (mismos colores/tipografía —
no inventar valores nuevos, copiar estilos del Dashboard).

## Componentes a crear (como componentes reusables de Figma, no capas sueltas)

**1. Chip** — variante `normal` / `seleccionada`
- normal: fondo transparente, borde 0.5px `border/light`, texto `text/secondary`, radio 20px, padding 8px 16px
- seleccionada: fondo `brand/accent` al 10% (o un tono cream oscurecido si preferís sin opacidad), borde `brand/accent`, texto `brand/accent` bold
- Usar auto-layout horizontal, hug width — así el texto largo no rompe el chip (lección ya aprendida en pantalla 1: auto-layout resiste texto largo)

**2. Segmented control** — 2 opciones: "Egreso" / "Ingreso"
- Contenedor: fondo `#F0E9DB` (mismo que el fondo de ícono circular del Dashboard), radio 12px, padding 4px, auto-layout horizontal
- Opción activa: fondo blanco, texto `semantic/expense` si es Egreso o `semantic/income` si es Ingreso, radio 8px
- Opción inactiva: fondo transparente, texto `text/secondary`
- Esto reemplaza el chip de categoría-tipo — el tipo (ingreso/egreso) decide el color del monto y qué chips de categoría mostrar después (opcional: categorías distintas por tipo)

**3. Botón con estado deshabilitado**
- Variante habilitada: fondo `brand/accent`, texto blanco, radio 12px (igual que `.boton-principal` del CSS ya existente)
- Variante deshabilitada: fondo `border/light`, texto `text/secondary`, sin interacción — se activa recién cuando monto > 0 y hay categoría elegida

## Sheet completo (frame "Sheet carga", 375×altura hug, overlay superior)

De abajo hacia arriba dentro del sheet (auto-layout vertical, padding 24px, gap 20px,
fondo `background/cream`, esquinas superiores redondeadas 20px):

1. **Overlay** (fuera del sheet, es la capa de atrás): rectángulo negro al 40% de opacidad
   cubriendo el frame completo — en Figma, un frame aparte detrás del sheet, no adentro
2. **Handle**: barra chica centrada, 40×4px, radio 2px, color `border/light` — indica que el
   sheet se puede arrastrar/cerrar (aunque el prototipo real solo simule tap para cerrar)
3. **Segmented Egreso/Ingreso** (componente de arriba), full width
4. **Monto display**: número grande centrado, mismo estilo que el saldo del Dashboard (32-38px
   bold), placeholder "$0" en `text/secondary` cuando está vacío, color cambia a
   `semantic/expense` o `semantic/income` según el segmented
5. **Fila de chips de categoría**: wrap horizontal, gap 8px, usando el componente Chip —
   mínimo 6 categorías (mismas que en el Dashboard: Alimentación, Trabajo, Transporte, Hogar,
   Salud, Ocio, Otros)
6. **Pill de billetera** (REUSAR el mismo componente pill del Dashboard, "Billetera 1 ▾") —
   consistencia: el mismo componente en dos pantallas, no una variante nueva
7. **CTA**: botón "Agregar" (componente de arriba), full width, deshabilitado por defecto

## Los 3 estados a diseñar (variantes del mismo frame, o 3 frames separados)

- **Vacío**: sin categoría elegida, monto en "$0", CTA deshabilitado
- **Egreso completo**: segmented en Egreso, categoría elegida (chip seleccionada), monto > 0,
  CTA habilitado, monto en rojo (`semantic/expense`)
- **Ingreso completo**: igual pero segmented en Ingreso, monto en verde (`semantic/income`)

## Primer prototipo (Figma Prototype tab)

- Interacción: tap en el FAB del Dashboard → "Open overlay" → aparece el frame "Sheet carga"
  con transición "Move in" desde abajo, easing ease-out, ~250ms
- El overlay de fondo (rectángulo 40%) también con "Smart animate" para que aparezca junto al sheet

## Tests de rotura (verificar en el diseño antes de darlo por terminado)

- **Monto de 8 dígitos** (ej: "$99.999.999"): el monto display no debe desbordar el frame de
  375px ni superponerse con nada — probar con auto-layout `hug` + `min-width` o achicando el
  tamaño de fuente si excede el ancho (decisión de diseño: preferible achicar tipografía a
  truncar un monto, la plata nunca se trunca)
- **Chip de categoría largo** (ej: una categoría custom de 20+ caracteres si en el futuro se
  permiten categorías propias): el chip no debe romper el layout de la fila — con auto-layout
  `wrap` + `hug` por chip, el chip se agranda o baja de línea, nunca corta texto

## Qué NO entra en esta pantalla (para no scope-creep)

- Selector de billetera múltiple funcional (sigue siendo de una sola opción, visual)
- Fecha custom (asumir "hoy" siempre, agregar selector de fecha es una iteración futura)
- Descripción libre de texto (por ahora la categoría alcanza; agregar campo de texto si hace falta)
