// Valores fijos de la app. Todo número o texto repetido, o que pueda cambiar, vive acá.

const CLAVE_STORAGE_IMAGENES = 'rakudotcom.galeria.imagenes';

const TITULO_MAXIMO = 80;

// localStorage tiene poco espacio (~5 MB en total), así que los archivos se limitan.
// Para imágenes más grandes conviene un servicio de hosting y pegar la URL.
const TAMANIO_MAXIMO_ARCHIVO_MB = 1;
const TAMANIO_MAXIMO_ARCHIVO_BYTES = TAMANIO_MAXIMO_ARCHIVO_MB * 1024 * 1024;

const ETIQUETAS = ['boceto', 'logo', 'interfaz', 'ilustración', 'otro'];
const OPCION_SIN_ETIQUETA = 'Sin etiqueta';

const MENSAJES = {
  tituloVacio: 'Escribí un título para la imagen.',
  tituloLargo: `El título puede tener hasta ${TITULO_MAXIMO} caracteres.`,
  sinImagen: 'Elegí un archivo de imagen o pegá una URL.',
  dosFuentes: 'Cargá el archivo o la URL, pero no los dos a la vez.',
  archivoNoEsImagen: 'El archivo tiene que ser una imagen (JPG, PNG, GIF, WebP…).',
  archivoMuyGrande: `La imagen pesa más de ${TAMANIO_MAXIMO_ARCHIVO_MB} MB. Probá con una más liviana, o subila a un servicio de imágenes y pegá la URL.`,
  archivoIlegible: 'No se pudo leer el archivo. Probá de nuevo o usá otro.',
  urlInvalida: 'La URL tiene que empezar con http:// o https://.',
  etiquetaInvalida: 'Elegí una etiqueta de la lista.',
  errorGuardar: 'No se pudieron guardar las imágenes: el espacio del navegador es limitado. La imagen se ve ahora, pero puede perderse al recargar la página.',
  errorLeer: 'No se pudieron leer las imágenes guardadas. La galería arranca vacía.',
  sinImagenes: 'Todavía no subiste ninguna imagen.',
};
