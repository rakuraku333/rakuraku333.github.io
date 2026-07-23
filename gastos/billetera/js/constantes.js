// Valores fijos de la app. Todo número o texto repetido, o que pueda cambiar, vive acá.

const CLAVE_STORAGE_TRANSACCIONES = 'rakudotcom.billetera.transacciones';

// Formato de moneda argentina (ej: $ 1.500,50).
const LOCALE_MONEDA = 'es-AR';
const CODIGO_MONEDA = 'ARS';

const ICONOS_CATEGORIA = {
  Alimentación: '🍞',
  Trabajo: '💼',
  Transporte: '🚌',
  Hogar: '🏠',
  Salud: '💊',
  Ocio: '🎉',
  Otros: '📦',
};

const ICONO_CATEGORIA_POR_DEFECTO = '📦';

// Dato fijo hasta que exista la pantalla 2 (CRUD de deudas).
const DEUDA_EJEMPLO = {
  nombre: 'Tarjeta Visa',
  montoPagado: 38000,
  montoTotal: 100000,
  proximaCuota: '15 de agosto',
};

const MENSAJES = {
  listaVacia: 'Todavía no cargaste ninguna transacción.',
  errorGuardar: 'No se pudieron guardar las transacciones en este navegador. Los datos se ven en pantalla, pero pueden perderse al recargar la página.',
  errorLeer: 'No se pudieron leer las transacciones guardadas. La app arranca con la lista vacía.',
};
