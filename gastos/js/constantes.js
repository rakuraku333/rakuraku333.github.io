// Valores fijos de la app. Todo número o texto repetido, o que pueda cambiar, vive acá.

const CLAVE_STORAGE_GASTOS = 'rakudotcom.gastos';

const CATEGORIAS = ['Comida', 'Transporte', 'Hogar', 'Salud', 'Ocio', 'Otros'];

const MONTO_MAXIMO = 99999999;

// Formato de moneda argentina (ej: $ 1.500,50).
const LOCALE_MONEDA = 'es-AR';
const CODIGO_MONEDA = 'ARS';

const OPCION_CATEGORIA_VACIA = 'Elegí una categoría';

const MENSAJES = {
  montoInvalido: `El monto tiene que ser un número mayor a 0 (hasta ${MONTO_MAXIMO.toLocaleString(LOCALE_MONEDA)}).`,
  categoriaInvalida: 'Elegí una categoría de la lista.',
  fechaInvalida: 'Elegí una fecha para el gasto.',
  errorGuardar: 'No se pudieron guardar los gastos en este navegador. El gasto se ve en pantalla, pero puede perderse al recargar la página.',
  errorLeer: 'No se pudieron leer los gastos guardados. La app arranca con la lista vacía.',
  listaVacia: 'Todavía no cargaste ningún gasto.',
  sinResultadosFiltro: 'No hay gastos en el período elegido.',
};
