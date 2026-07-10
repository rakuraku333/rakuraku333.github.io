// Reglas de negocio: validaciones y cálculos. Este archivo no toca el DOM ni localStorage.

function esMontoValido(monto) {
  return Number.isFinite(monto) && monto > 0 && monto <= MONTO_MAXIMO;
}

function esCategoriaValida(categoria) {
  return CATEGORIAS.includes(categoria);
}

function esFechaValida(fecha) {
  // El input type="date" entrega la fecha como "AAAA-MM-DD" (o "" si está vacío).
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

// Devuelve el mensaje del primer error encontrado, o null si el gasto es válido.
function validarNuevoGasto(gasto) {
  if (!esMontoValido(gasto.monto)) {
    return MENSAJES.montoInvalido;
  }
  if (!esCategoriaValida(gasto.categoria)) {
    return MENSAJES.categoriaInvalida;
  }
  if (!esFechaValida(gasto.fecha)) {
    return MENSAJES.fechaInvalida;
  }
  return null;
}

function crearIdUnico() {
  // Date.now() solo no alcanza: dos gastos cargados en el mismo milisegundo repetirían id.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function crearGasto(monto, categoria, fecha) {
  return { id: crearIdUnico(), monto, categoria, fecha };
}

function quitarGastoPorId(gastos, idGasto) {
  return gastos.filter(gasto => gasto.id !== idGasto);
}

function calcularTotalGeneral(gastos) {
  return gastos.reduce((suma, gasto) => suma + gasto.monto, 0);
}

// Devuelve un objeto { categoria: total } solo con las categorías que tienen gastos.
function calcularTotalesPorCategoria(gastos) {
  const totales = {};
  for (const gasto of gastos) {
    totales[gasto.categoria] = (totales[gasto.categoria] || 0) + gasto.monto;
  }
  return totales;
}

// Filtra por rango inclusivo. Un extremo vacío ("") significa "sin límite" de ese lado.
function filtrarPorFecha(gastos, fechaDesde, fechaHasta) {
  return gastos.filter(gasto => {
    const cumpleDesde = fechaDesde === '' || gasto.fecha >= fechaDesde;
    const cumpleHasta = fechaHasta === '' || gasto.fecha <= fechaHasta;
    return cumpleDesde && cumpleHasta;
  });
}

function ordenarPorFechaDescendente(gastos) {
  // Comparar strings "AAAA-MM-DD" ordena igual que comparar fechas.
  return [...gastos].sort((gastoA, gastoB) => gastoB.fecha.localeCompare(gastoA.fecha));
}

function obtenerFechaDeHoy() {
  // Se arma a mano para usar la fecha local: toISOString() usa UTC y de noche puede dar otro día.
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}
