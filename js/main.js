// Punto de entrada de la bitácora: toma las entradas publicadas (blog/datos/) y las
// dibuja como burbujas en el hilo, de la más nueva a la más vieja. Reutiliza las
// funciones puras del blog —ordenar y formatear— cargadas desde ../blog/js/logica.js.

const hiloBitacora = document.getElementById('hilo-bitacora');
const avisoSinNotas = document.getElementById('aviso-sin-notas');

function iniciarBitacora() {
  const entradas = ordenarPorCreacionDescendente(obtenerEntradasPublicadas());

  if (entradas.length === 0) {
    avisoSinNotas.textContent = TEXTOS_BITACORA.sinNotas;
    avisoSinNotas.hidden = false;
    return;
  }

  for (const entrada of entradas) {
    hiloBitacora.appendChild(crearBurbuja(entrada));
  }

  mostrarSeguirLeyendoDondeHagaFalta();
}

// El archivo de publicadas puede faltar o no cargar: la portada no debe romperse.
function obtenerEntradasPublicadas() {
  if (typeof ENTRADAS_PUBLICADAS === 'undefined' || !Array.isArray(ENTRADAS_PUBLICADAS)) {
    return [];
  }
  return ENTRADAS_PUBLICADAS;
}

function crearBurbuja(entrada) {
  const item = document.createElement('li');
  item.className = 'burbuja-entrada';

  const fecha = document.createElement('span');
  fecha.className = 'fecha-burbuja';
  fecha.textContent = formatearFecha(entrada.fechaCreacion);

  const titulo = document.createElement('h3');
  titulo.className = 'titulo-burbuja';
  const enlaceTitulo = document.createElement('a');
  enlaceTitulo.href = RUTA_DETALLE_ENTRADA + entrada.id;
  enlaceTitulo.textContent = entrada.titulo;
  titulo.appendChild(enlaceTitulo);

  const contenido = document.createElement('div');
  contenido.className = 'contenido-burbuja recortada';
  // formatearContenido escapa el HTML del texto: es seguro asignarlo como innerHTML.
  contenido.innerHTML = formatearContenido(entrada.contenido);

  // El link nace oculto: recién con la burbuja en el DOM se sabe si hace falta.
  const enlaceSeguir = document.createElement('a');
  enlaceSeguir.className = 'enlace-seguir-leyendo';
  enlaceSeguir.href = RUTA_DETALLE_ENTRADA + entrada.id;
  enlaceSeguir.textContent = TEXTOS_BITACORA.seguirLeyendo;
  enlaceSeguir.hidden = true;

  item.append(fecha, titulo, contenido, enlaceSeguir);
  return item;
}

// Con las burbujas ya en el DOM se mide cuáles desbordan el recorte del CSS: se
// compara la altura recortada contra la altura real sin recorte (comparar contra
// scrollHeight daba falsos positivos por redondeo de píxeles, p. ej. con emojis).
function mostrarSeguirLeyendoDondeHagaFalta() {
  for (const burbuja of hiloBitacora.querySelectorAll('.burbuja-entrada')) {
    const contenido = burbuja.querySelector('.contenido-burbuja');
    const enlaceSeguir = burbuja.querySelector('.enlace-seguir-leyendo');

    const alturaRecortada = contenido.clientHeight;
    contenido.classList.remove('recortada');
    const alturaCompleta = contenido.clientHeight;

    // Solo si el recorte esconde contenido de verdad se restaura y se ofrece el link.
    if (alturaCompleta > alturaRecortada + 2) {
      contenido.classList.add('recortada');
      enlaceSeguir.hidden = false;
    }
  }
}

iniciarBitacora();
