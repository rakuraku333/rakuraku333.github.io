// Reglas de negocio: validaciones, creación y búsqueda de imágenes.
// Este archivo no toca el DOM ni localStorage.

// Devuelve el mensaje del primer error encontrado, o null si los datos son válidos.
// `datos.archivo` es un File del navegador (o null si no se eligió ninguno).
function validarNuevaImagen(datos) {
  const titulo = datos.titulo.trim();
  const url = datos.url.trim();
  const hayArchivo = datos.archivo !== null;
  const hayUrl = url !== '';

  if (titulo === '') {
    return MENSAJES.tituloVacio;
  }
  if (titulo.length > TITULO_MAXIMO) {
    return MENSAJES.tituloLargo;
  }
  if (!esEtiquetaValida(datos.etiqueta)) {
    return MENSAJES.etiquetaInvalida;
  }
  if (!hayArchivo && !hayUrl) {
    return MENSAJES.sinImagen;
  }
  if (hayArchivo && hayUrl) {
    return MENSAJES.dosFuentes;
  }
  if (hayArchivo && !esArchivoDeImagen(datos.archivo)) {
    return MENSAJES.archivoNoEsImagen;
  }
  if (hayArchivo && datos.archivo.size > TAMANIO_MAXIMO_ARCHIVO_BYTES) {
    return MENSAJES.archivoMuyGrande;
  }
  if (hayUrl && !esUrlValida(url)) {
    return MENSAJES.urlInvalida;
  }
  return null;
}

function esArchivoDeImagen(archivo) {
  return archivo.type.startsWith('image/');
}

function esUrlValida(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

// La etiqueta es opcional: "" significa "sin etiqueta".
function esEtiquetaValida(etiqueta) {
  return etiqueta === '' || ETIQUETAS.includes(etiqueta);
}

function crearIdUnico() {
  // Date.now() solo no alcanza: dos imágenes en el mismo milisegundo repetirían id.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// `urlImagen` puede ser una URL externa o el archivo convertido a texto (data URL).
function crearImagen(urlImagen, titulo, etiqueta) {
  return {
    id: crearIdUnico(),
    urlImagen,
    titulo: titulo.trim(),
    etiqueta,
    fechaCreacion: obtenerFechaHoraActual(),
  };
}

function buscarImagenPorId(imagenes, idImagen) {
  const imagen = imagenes.find(imagen => imagen.id === idImagen);
  return imagen === undefined ? null : imagen;
}

function quitarImagenPorId(imagenes, idImagen) {
  return imagenes.filter(imagen => imagen.id !== idImagen);
}

function ordenarPorCreacionDescendente(imagenes) {
  // El formato "2026-07-09T14:30:05" ordena igual como texto que como fecha.
  return [...imagenes].sort((imagenA, imagenB) =>
    imagenB.fechaCreacion.localeCompare(imagenA.fechaCreacion)
  );
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
