// Reglas de negocio: validaciones, creación y búsqueda de entradas, formato seguro
// de texto a HTML y lectura de rutas. Este archivo no toca el DOM ni localStorage.

// Devuelve el mensaje del primer error encontrado, o null si la entrada es válida.
function validarNuevaEntrada(entrada) {
  const titulo = entrada.titulo.trim();
  const contenido = entrada.contenido.trim();

  if (titulo === '') {
    return MENSAJES.tituloVacio;
  }
  if (titulo.length > TITULO_MAXIMO) {
    return MENSAJES.tituloLargo;
  }
  if (contenido === '') {
    return MENSAJES.contenidoVacio;
  }
  if (contenido.length > CONTENIDO_MAXIMO) {
    return MENSAJES.contenidoLargo;
  }
  return null;
}

function crearIdUnico() {
  // Date.now() solo no alcanza: dos entradas en el mismo milisegundo repetirían id.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function crearEntrada(titulo, contenido) {
  return {
    id: crearIdUnico(),
    titulo: titulo.trim(),
    contenido: contenido.trim(),
    fechaCreacion: obtenerFechaHoraActual(),
  };
}

function buscarEntradaPorId(entradas, idEntrada) {
  const entrada = entradas.find(entrada => entrada.id === idEntrada);
  return entrada === undefined ? null : entrada;
}

function quitarEntradaPorId(entradas, idEntrada) {
  return entradas.filter(entrada => entrada.id !== idEntrada);
}

function ordenarPorCreacionDescendente(entradas) {
  // El formato "2026-07-09T14:30:05" ordena igual como texto que como fecha.
  return [...entradas].sort((entradaA, entradaB) =>
    entradaB.fechaCreacion.localeCompare(entradaA.fechaCreacion)
  );
}

// Extrae el id de entrada de un hash como "#entrada/<id>". Devuelve null si el hash
// no apunta a una entrada (o sea, si corresponde mostrar el listado).
function extraerIdDeHash(hash) {
  if (!hash.startsWith(PREFIJO_HASH_ENTRADA)) {
    return null;
  }
  const idEntrada = hash.slice(PREFIJO_HASH_ENTRADA.length);
  return idEntrada === '' ? null : idEntrada;
}

function obtenerFechaHoraActual() {
  // Fecha y hora locales en formato ordenable ("2026-07-09T14:30:05.123").
  // Se arma a mano: toISOString() usa UTC y de noche puede dar otro día.
  // Lleva milisegundos para que dos altas muy seguidas no empaten al ordenar.
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  const milisegundos = String(ahora.getMilliseconds()).padStart(3, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}T${horas}:${minutos}:${segundos}.${milisegundos}`;
}

/* Formato de texto. Funciones puras (texto -> texto): por eso viven acá y no en ui.js.
   La landing también carga este archivo para dibujar la bitácora con el mismo formato. */

function formatearFecha(fechaCreacion) {
  // De "2026-07-09T14:30:05" muestra solo la fecha, como "09/07/2026".
  const [fecha] = fechaCreacion.split('T');
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function escaparHtml(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Convierte el texto plano de una entrada en HTML seguro para mostrar:
// 1. escapa el HTML (nada de lo que se escriba puede ejecutarse como código),
// 2. aplica **negrita** y *cursiva* dentro de cada línea,
// 3. arma párrafos con las líneas en blanco y saltos simples con <br>.
function formatearContenido(contenido) {
  const textoSeguro = escaparHtml(contenido);
  const conNegrita = textoSeguro.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  const conCursiva = conNegrita.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  const parrafos = conCursiva.split(/\n\s*\n/);
  return parrafos
    .map(parrafo => `<p>${parrafo.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/* Publicadas vs. borradores: las publicadas viven en datos/entradas-publicadas.js
   (contenido commiteado del repo); los borradores, en el localStorage del navegador. */

// Un borrador cuyo id ya figura entre las publicadas terminó su ciclo: se exportó
// y se commiteó. Devuelve solo los borradores que siguen vigentes.
function quitarBorradoresYaPublicados(publicadas, borradores) {
  const idsPublicados = new Set(publicadas.map(entrada => entrada.id));
  return borradores.filter(borrador => !idsPublicados.has(borrador.id));
}

// Arma el contenido completo del archivo datos/entradas-publicadas.js.
// Devuelve texto; descargarlo como archivo es trabajo de ui.js.
function generarArchivoPublicadas(entradas) {
  return `${ENCABEZADO_ARCHIVO_PUBLICADAS}\nconst ENTRADAS_PUBLICADAS = ${JSON.stringify(entradas, null, 2)};\n`;
}
