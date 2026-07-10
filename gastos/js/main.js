// Punto de entrada: mantiene la lista de gastos en memoria y conecta storage, lógica y ui.

let gastos = [];

function iniciarAplicacion() {
  rellenarSelectCategorias();
  establecerFechaPorDefecto(obtenerFechaDeHoy());

  const gastosGuardados = leerGastos();
  if (gastosGuardados === null) {
    gastos = [];
    mostrarMensajeError(MENSAJES.errorLeer);
  } else {
    gastos = gastosGuardados;
  }

  registrarEnvioDeFormulario(manejarNuevoGasto);
  registrarCambioDeFiltros(actualizarPantalla);
  registrarLimpiezaDeFiltros(manejarLimpiezaDeFiltros);
  registrarEliminacionDeGasto(manejarEliminacionDeGasto);

  actualizarPantalla();
}

function manejarNuevoGasto() {
  ocultarMensaje();

  const datosDelFormulario = leerFormularioGasto();
  const mensajeDeError = validarNuevoGasto(datosDelFormulario);
  if (mensajeDeError !== null) {
    mostrarMensajeError(mensajeDeError);
    return;
  }

  const nuevoGasto = crearGasto(
    datosDelFormulario.monto,
    datosDelFormulario.categoria,
    datosDelFormulario.fecha
  );
  gastos.push(nuevoGasto);

  guardarCambios();
  limpiarFormularioGasto();
  actualizarPantalla();
}

function manejarEliminacionDeGasto(idGasto) {
  ocultarMensaje();
  gastos = quitarGastoPorId(gastos, idGasto);
  guardarCambios();
  actualizarPantalla();
}

function manejarLimpiezaDeFiltros() {
  limpiarFiltros();
  actualizarPantalla();
}

function guardarCambios() {
  const seGuardo = guardarGastos(gastos);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }
}

// Vuelve a dibujar la lista y los totales según los filtros activos.
function actualizarPantalla() {
  const filtros = leerFiltros();
  const hayFiltroActivo = filtros.desde !== '' || filtros.hasta !== '';

  const gastosFiltrados = filtrarPorFecha(gastos, filtros.desde, filtros.hasta);
  const gastosOrdenados = ordenarPorFechaDescendente(gastosFiltrados);

  renderizarListaGastos(gastosOrdenados);
  if (gastosOrdenados.length === 0) {
    mostrarAvisoListaVacia(hayFiltroActivo ? MENSAJES.sinResultadosFiltro : MENSAJES.listaVacia);
  } else {
    ocultarAvisoListaVacia();
  }

  renderizarTotales(
    calcularTotalGeneral(gastosFiltrados),
    calcularTotalesPorCategoria(gastosFiltrados)
  );
  mostrarNotaDeFiltro(hayFiltroActivo);
}

iniciarAplicacion();
