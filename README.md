# rakudotcom

Sitio personal de raku: bitácora, portfolio y un hub de herramientas simples.
Hecho a mano con los fundamentos de la web: HTML, CSS y JavaScript.
Vanilla a propósito — un sitio personal no necesita más: clonás, abrís `index.html` y funciona.

![Bitácora](capturas/bitacora.png)

## Qué hay acá

- **Bitácora** (`/`) — notas publicadas en cascada, la más nueva arriba. El contenido es parte del repo: `blog/datos/entradas-publicadas.js`.
- **Proyectos** (`proyectos/`) — la vidriera de apps.
- **Sobre mí** (`sobre-mi/`) — bio y contacto.
- **Apps** — [gastos](gastos/) (rakucash: billetera personal con deudas, análisis y multi-billetera — también instalable como APK Android), [blog](blog/) (el taller de la bitácora), [hábitos](habitos/), [galería](galeria/), [waveforge](waveforge/) (motor GPU de visuales audio-reactivos en Python) y [ocaso](ocaso/) (un torii y un ocaso animados, algoritmos porteados de waveforge). Cada una resuelve una sola cosa; los datos de quien las usa quedan en su propio navegador (localStorage).

![Proyectos](capturas/proyectos.png)

## Correr local

Sin dependencias: clonar y abrir `index.html` en el navegador. Todo funciona via `file://`, con una excepción: `gastos/` (rakucash) es un build de Vite/TypeScript — necesita servirse por http (`python3 -m http.server` desde `gastos/`, o cualquier estático) porque los navegadores bloquean módulos ES vía `file://`. El código fuente y el resto del roadmap viven en su propio repo (`apprakucash`); acá solo vive el build publicado.

## Publicar una entrada en la bitácora

1. Escribir un borrador en el editor del blog (queda en localStorage, con insignia "borrador").
2. Tocar **Exportar para publicar**: se descarga `entradas-publicadas.js` con todo el contenido.
3. Correr `./publicar.sh "bitacora: mi nota"` — mueve el export al repo, commitea y pushea (o hacerlo a mano: reemplazar `blog/datos/entradas-publicadas.js` y commitear). Al recargar el blog, el borrador local se limpia solo.

## Estructura y convenciones

Cada app vive en su carpeta: `index.html` + `css/` (variables, layout, componentes) + `js/` (constantes, storage, lógica, ui, main — una responsabilidad por archivo). `variables.css` es idéntico en todas: la paleta cream + torii es lo que da identidad al hub. Excepción: `gastos/` es el build estático de un proyecto Vite/TypeScript aparte (`apprakucash`) — mismas capas, pero bundleadas en `assets/`.
