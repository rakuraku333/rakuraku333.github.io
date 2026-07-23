// Reglas de negocio: cálculos sobre transacciones y deuda. Este archivo no toca el DOM ni localStorage.

function calcularTotalIngresos(transacciones) {
  return transacciones
    .filter(transaccion => transaccion.tipo === 'ingreso')
    .reduce((suma, transaccion) => suma + transaccion.monto, 0);
}

function calcularTotalEgresos(transacciones) {
  return transacciones
    .filter(transaccion => transaccion.tipo === 'egreso')
    .reduce((suma, transaccion) => suma + transaccion.monto, 0);
}

function calcularSaldoTotal(transacciones) {
  return calcularTotalIngresos(transacciones) - calcularTotalEgresos(transacciones);
}

function calcularPorcentajeDeuda(deuda) {
  if (!Number.isFinite(deuda.montoTotal) || deuda.montoTotal <= 0) {
    return 0;
  }
  const porcentaje = (deuda.montoPagado / deuda.montoTotal) * 100;
  return Math.min(100, Math.max(0, Math.round(porcentaje)));
}

function obtenerIconoCategoria(categoria) {
  return ICONOS_CATEGORIA[categoria] || ICONO_CATEGORIA_POR_DEFECTO;
}

// obtenerFechaDeHoy() es independiente de gastos/js/logica.js: este módulo no puede
// importar de otra vista, así que se reescribe acá con el mismo patrón.
function obtenerFechaDeHoy() {
  // Se arma a mano para usar la fecha local: toISOString() usa UTC y de noche puede dar otro día.
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function restarUnDia(fechaIso) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia - 1);
  const mesResultado = String(fecha.getMonth() + 1).padStart(2, '0');
  const diaResultado = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mesResultado}-${diaResultado}`;
}

function obtenerEtiquetaFecha(fechaIso, hoyIso) {
  if (fechaIso === hoyIso) {
    return 'Hoy';
  }
  if (fechaIso === restarUnDia(hoyIso)) {
    return 'Ayer';
  }
  const [, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}`;
}

function esFormularioValido(monto, categoria) {
  return monto > 0 && !!categoria;
}

function crearTransaccion(tipo, monto, categoria) {
  return { tipo, monto, categoria, descripcion: categoria, fecha: obtenerFechaDeHoy() };
}
