// Valores fijos de la app. Todo número o texto repetido, o que pueda cambiar, vive acá.

const CLAVE_STORAGE_HABITOS = 'rakudotcom.habitos';

const NOMBRE_MAXIMO = 60;

const MENSAJES = {
  nombreVacio: 'Escribí un nombre para el hábito.',
  nombreLargo: `El nombre puede tener hasta ${NOMBRE_MAXIMO} caracteres.`,
  nombreDuplicado: 'Ya tenés un hábito con ese nombre.',
  errorGuardar: 'No se pudieron guardar los hábitos en este navegador. Los cambios se ven en pantalla, pero pueden perderse al recargar la página.',
  errorLeer: 'No se pudieron leer los hábitos guardados. La app arranca con la lista vacía.',
  sinHabitos: 'Todavía no agregaste ningún hábito.',
};
