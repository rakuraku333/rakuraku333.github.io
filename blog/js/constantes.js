// Valores fijos de la app. Todo número o texto repetido, o que pueda cambiar, vive acá.

const CLAVE_STORAGE_ENTRADAS = 'rakudotcom.blog.entradas';

const TITULO_MAXIMO = 120;
const CONTENIDO_MAXIMO = 20000;

// Las rutas de la app son el hash de la URL: "" = listado, "#entrada/<id>" = detalle.
const PREFIJO_HASH_ENTRADA = '#entrada/';

// Publicación: el contenido público vive en datos/entradas-publicadas.js.
const NOMBRE_ARCHIVO_PUBLICADAS = 'entradas-publicadas.js';
const TEXTO_ETIQUETA_BORRADOR = 'borrador';

// Cabecera del archivo que genera "Exportar para publicar" (idéntica a la del archivo real).
const ENCABEZADO_ARCHIVO_PUBLICADAS = `// Entradas publicadas de la bitácora: este archivo ES el contenido público del sitio.
// La landing y el blog lo leen tal cual; los visitantes ven exactamente lo que hay acá.
//
// Cómo publicar: escribí un borrador en el blog, tocá "Exportar para publicar" y
// reemplazá este archivo con el que se descarga. Después: commit y listo.
// Cada entrada tiene la misma forma que las del editor: {id, titulo, contenido, fechaCreacion}.
`;

const MENSAJES = {
  tituloVacio: 'Escribí un título para la entrada.',
  tituloLargo: `El título puede tener hasta ${TITULO_MAXIMO} caracteres.`,
  contenidoVacio: 'Escribí el contenido de la entrada.',
  contenidoLargo: `El contenido puede tener hasta ${CONTENIDO_MAXIMO} caracteres.`,
  errorGuardar: 'No se pudieron guardar los borradores en este navegador. La entrada se ve en pantalla, pero puede perderse al recargar la página.',
  errorLeer: 'No se pudieron leer los borradores guardados. Se muestran solo las entradas publicadas.',
  sinEntradas: 'Todavía no hay entradas: escribí el primer borrador.',
  entradaNoEncontrada: 'No se encontró esa entrada. Volviste al listado.',
  soloBorradoresSeEliminan: 'Esa entrada ya está publicada: se edita o elimina en el repo, en blog/datos/entradas-publicadas.js.',
  nadaParaExportar: 'No hay nada para exportar todavía: escribí al menos un borrador.',
  exportacionLista: 'Se descargó entradas-publicadas.js. Reemplazá blog/datos/entradas-publicadas.js con ese archivo y commiteá para publicar.',
};
