// Reader público de la bitácora: dibuja todas las entradas publicadas en full
// (sin recorte "seguir leyendo" — a esta altura del sitio, la entrada se lee
// entera). Chips + filtro. Si la URL trae #entrada/<id>, hace scroll a esa
// burbuja al terminar de dibujar.
//
// Re-ejecuta en cada astro:page-load porque el DOM puede ser nuevo.
// El renderer reusa formatearFecha/formatearContenido/ordenarPorCreacionDescendente
// de /blog/js/logica.js, cargado antes de este script.

const RUTA_ENTRADA = '/blog/#entrada/';
const TEXTOS = {
  sinNotas: 'Todavía no hay notas publicadas. La primera está en camino.',
};

function iniciarBitacora() {
  const hilo = document.getElementById('hilo-bitacora');
  if (!hilo) return;
  const aviso = document.getElementById('aviso-sin-notas');
  const barraFiltros = document.getElementById('filtros-bitacora');

  if (hilo.children.length > 0) return;

  const entradas = ordenarPorCreacionDescendente(obtenerEntradasPublicadas());
  if (entradas.length === 0) {
    aviso.textContent = TEXTOS.sinNotas;
    aviso.hidden = false;
    return;
  }

  for (const entrada of entradas) hilo.appendChild(crearBurbuja(entrada));

  if (barraFiltros) armarFiltros(barraFiltros, hilo, entradas);

  scrollearAlHash();
}

function obtenerEntradasPublicadas() {
  if (typeof ENTRADAS_PUBLICADAS === 'undefined' || !Array.isArray(ENTRADAS_PUBLICADAS)) {
    return [];
  }
  return ENTRADAS_PUBLICADAS;
}

function crearBurbuja(entrada) {
  const item = document.createElement('li');
  item.className = 'burbuja-entrada';
  item.id = 'entrada-' + entrada.id;
  const etiquetas = Array.isArray(entrada.etiquetas) ? entrada.etiquetas : [];
  if (etiquetas.length > 0) item.dataset.etiquetas = etiquetas.join(' ');

  const fecha = document.createElement('span');
  fecha.className = 'fecha-burbuja';
  fecha.textContent = formatearFecha(entrada.fechaCreacion);

  const titulo = document.createElement('h3');
  titulo.className = 'titulo-burbuja';
  const enlaceTitulo = document.createElement('a');
  enlaceTitulo.href = RUTA_ENTRADA + entrada.id;
  enlaceTitulo.textContent = entrada.titulo;
  titulo.appendChild(enlaceTitulo);

  const contenido = document.createElement('div');
  contenido.className = 'contenido-burbuja';
  // formatearContenido escapa el HTML: es seguro asignarlo como innerHTML.
  contenido.innerHTML = formatearContenido(entrada.contenido);

  item.append(fecha, titulo, contenido);

  const imagenes = Array.isArray(entrada.imagenes) ? entrada.imagenes : [];
  if (imagenes.length > 0) {
    const grilla = document.createElement('div');
    grilla.className = 'imagenes-burbuja';
    for (const src of imagenes) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton-captura imagen-burbuja';
      boton.dataset.full = src;
      boton.dataset.alt = entrada.titulo;
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      boton.appendChild(img);
      grilla.appendChild(boton);
    }
    item.appendChild(grilla);
  }

  if (etiquetas.length > 0) {
    const chips = document.createElement('div');
    chips.className = 'chips-etiquetas';
    for (const t of etiquetas) {
      const c = document.createElement('span');
      c.className = 'pastilla';
      c.textContent = t;
      chips.appendChild(c);
    }
    item.appendChild(chips);
  }

  return item;
}

// Junta todas las etiquetas de las entradas y arma botones de filtro.
function armarFiltros(barra, hilo, entradas) {
  const todas = new Set();
  for (const e of entradas) {
    if (Array.isArray(e.etiquetas)) for (const t of e.etiquetas) todas.add(t);
  }
  if (todas.size === 0) return;

  barra.hidden = false;
  barra.appendChild(crearBotonFiltro('todas', 'todas', true));
  for (const t of [...todas].sort()) barra.appendChild(crearBotonFiltro(t, t, false));

  barra.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-etiqueta]');
    if (!boton) return;
    for (const b of barra.querySelectorAll('button[data-etiqueta]')) {
      b.setAttribute('aria-pressed', String(b === boton));
    }
    const filtro = boton.dataset.etiqueta;
    for (const b of hilo.querySelectorAll('.burbuja-entrada')) {
      const tags = (b.dataset.etiquetas || '').split(' ');
      b.hidden = filtro !== 'todas' && !tags.includes(filtro);
    }
  });
}

function crearBotonFiltro(etiqueta, texto, activo) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'boton-filtro';
  b.dataset.etiqueta = etiqueta;
  b.setAttribute('aria-pressed', String(activo));
  b.textContent = texto;
  return b;
}

// Si la URL trae #entrada/<id> (link viejo, RSS, permalink), scrollear al item.
function scrollearAlHash() {
  const hash = location.hash;
  if (!hash.startsWith('#entrada/')) return;
  const id = hash.slice('#entrada/'.length);
  const item = document.getElementById('entrada-' + id);
  if (item) item.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('astro:page-load', iniciarBitacora);
