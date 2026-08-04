// Chequeo del sitio compilado. Corre sobre dist/, sin dependencias ni navegador.
//
//   npm test        (compila y verifica)
//   node verificar.mjs   (verifica un dist/ que ya exista)
//
// Cubre la clase de error que introduce una migración de rutas: páginas que no
// se generan, links relativos que sobrevivieron a la mudanza a rutas absolutas,
// y archivos referenciados que no existen. Suma el contraste de la paleta,
// que ya falló una vez y no se ve mirando el CSS.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const DIST = 'dist';
const fallos = [];
const falla = (m) => fallos.push(m);

if (!existsSync(DIST)) {
  console.error(`No existe ${DIST}/. Corré "npm run build" primero.`);
  process.exit(1);
}

// ---- 1. Las páginas del hub se generaron ----

const RUTAS = [
  '', 'proyectos', 'blog', 'blog/taller', 'mission', 'galeria',
  'habitos', 'gastos', 'ocaso', 'pilates', 'waveforge',
];

for (const r of RUTAS) {
  if (!existsSync(join(DIST, r, 'index.html'))) falla(`falta la página /${r}/`);
}

// ---- 2. Rutas: nada relativo, y todo lo referenciado existe ----

// Lo que no se resuelve contra el disco: protocolos, anclas, y el src vacío de
// los <img> de lightbox, que su JS llena en runtime.
const EXTERNO = /^(https?:|mailto:|tel:|data:|#|\/\/)/;
const REFS = /(?:href|src)="([^"]*)"/g;

// Las piezas gráficas de servicios son lienzos autocontenidos que se exportan
// como imagen: no llevan el shell del hub y usan rutas propias.
const PIEZAS = ['servicios/flyer-circular.html', 'servicios/muestra-estilo.html'];

// Builds externos (rakucash, hábitos) y trabajo de cliente: vienen con sus
// propias rutas relativas y no se tocan desde este repo.
const AJENO = ['gastos/app/', 'habitos/app/', 'cafe-norte/'];

const paginas = [];
(function recorrer(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) recorrer(p);
    else if (e.endsWith('.html')) paginas.push(p);
  }
})(DIST);

for (const pagina of paginas) {
  const rel = pagina.slice(DIST.length + 1);
  if (AJENO.some((a) => rel.startsWith(a)) || PIEZAS.includes(rel)) continue;

  const html = readFileSync(pagina, 'utf8');
  const propia = !rel.startsWith('servicios/flyer.html');

  for (const [, ref] of html.matchAll(REFS)) {
    if (!ref || EXTERNO.test(ref)) continue;

    if (!ref.startsWith('/')) {
      if (propia) falla(`${rel}: ruta relativa "${ref}" (tras la migración van absolutas)`);
      continue;
    }
    const destino = ref.split(/[?#]/)[0];
    const enDisco = join(DIST, destino, destino.endsWith('/') ? 'index.html' : '');
    if (!existsSync(enDisco)) falla(`${rel}: "${ref}" no existe en ${DIST}/`);
  }
}

// ---- 3. La bitácora vive en /blog/: sus scripts cargan en orden y los ids que
//        blog-reader.js busca están en el HTML ----

const blog = readFileSync(join(DIST, 'blog/index.html'), 'utf8');
const ORDEN = [
  '/blog/datos/entradas-publicadas.js',
  '/blog/js/logica.js',
  '/js/blog-reader.js',
];
let cursor = -1;
for (const s of ORDEN) {
  const i = blog.indexOf(s);
  if (i === -1) falla(`/blog/ no carga ${s}`);
  else if (i < cursor) falla(`/blog/ carga ${s} fuera de orden (blog-reader.js depende de los previos)`);
  else cursor = i;
}
for (const id of ['hilo-bitacora', 'aviso-sin-notas']) {
  if (!blog.includes(`id="${id}"`)) falla(`/blog/ perdió #${id}, que blog-reader.js busca`);
}

// ---- 4. Contraste de la tinta contra el fondo (WCAG AA: 4.5:1) ----

const css = readFileSync('public/css/variables.css', 'utf8');
const token = (n) => css.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];

const luminancia = (hex) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);

const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const fondo = token('cream-bg');
for (const t of ['ink', 'ink-soft', 'ink-faint', 'torii-dark', 'ai']) {
  const c = contraste(token(t), fondo);
  if (c < 4.5) falla(`--${t} da ${c.toFixed(2)}:1 sobre --cream-bg (AA pide 4.5:1)`);
}

// ---- Resultado ----

if (fallos.length) {
  console.error(`\n${fallos.length} problema(s):\n` + fallos.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`OK: ${RUTAS.length} páginas, ${paginas.length} HTML revisados, rutas y contraste en orden.`);
