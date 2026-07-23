// Punto de entrada: lee las transacciones guardadas y conecta storage, lógica y ui.

let transacciones = [];
let tipoTransaccionActual = 'egreso';
let categoriaElegida = null;
let transaccionEditandoId = null;

function iniciarAplicacion() {
  const transaccionesGuardadas = leerTransacciones();
  if (transaccionesGuardadas === null) {
    transacciones = [];
    mostrarMensajeError(MENSAJES.errorLeer);
  } else {
    transacciones = transaccionesGuardadas;
  }

  const necesitaMigracionDeIds = transacciones.some(transaccion => !transaccion.id);
  transacciones = asegurarIds(transacciones);
  if (necesitaMigracionDeIds) {
    guardarTransacciones(transacciones);
  }

  actualizarPantalla();

  botonFab.addEventListener('click', manejarAperturaSheet);

  for (const boton of botonesSegmented) {
    boton.addEventListener('click', () => manejarCambioTipo(boton.dataset.tipo));
  }

  inputMonto.addEventListener('input', manejarInputMonto);

  botonAgregar.addEventListener('click', manejarAgregarTransaccion);
  botonBorrar.addEventListener('click', manejarBorrarTransaccion);

  tabInicio.addEventListener('click', evento => {
    evento.preventDefault();
    mostrarPantalla('inicio');
  });
  tabMovimientos.addEventListener('click', evento => {
    evento.preventDefault();
    mostrarPantalla('movimientos');
  });

  // Un click en el fondo oscuro (el propio <dialog>, no su contenido) también cierra.
  // La tecla Escape ya la maneja el navegador por ser un diálogo modal.
  dialogoSheetCarga.addEventListener('click', evento => {
    if (evento.target === dialogoSheetCarga) {
      cerrarSheetCarga();
    }
  });
}

function actualizarPantalla() {
  renderizarSaldo(calcularSaldoTotal(transacciones));
  renderizarResumenIngresoEgreso(
    calcularTotalIngresos(transacciones),
    calcularTotalEgresos(transacciones)
  );
  renderizarDeuda(DEUDA_EJEMPLO, calcularPorcentajeDeuda(DEUDA_EJEMPLO));
  renderizarTransaccionesRecientes(transacciones, manejarClickTransaccion);
  renderizarMovimientos(transacciones, manejarClickTransaccion);
}

function manejarAperturaSheet() {
  transaccionEditandoId = null;
  tipoTransaccionActual = 'egreso';
  categoriaElegida = null;
  renderizarChipsCategoria(categoriaElegida, manejarSeleccionCategoria);
  abrirSheetCarga();
}

function manejarClickTransaccion(id) {
  const transaccion = buscarTransaccionPorId(transacciones, id);
  if (!transaccion) {
    return;
  }
  transaccionEditandoId = id;
  tipoTransaccionActual = transaccion.tipo;
  categoriaElegida = transaccion.categoria;
  renderizarChipsCategoria(categoriaElegida, manejarSeleccionCategoria);
  abrirSheetCarga(transaccion);
}

function manejarCambioTipo(tipo) {
  tipoTransaccionActual = tipo;
  actualizarSegmented(tipo);
  actualizarColorMonto(tipo);
}

function manejarInputMonto() {
  inputMonto.value = inputMonto.value.replace(/\D/g, '');
  actualizarTamanoMonto();
  revalidarFormulario();
}

function manejarSeleccionCategoria(categoria) {
  categoriaElegida = categoria;
  renderizarChipsCategoria(categoriaElegida, manejarSeleccionCategoria);
  revalidarFormulario();
}

function revalidarFormulario() {
  const monto = Number(inputMonto.value) || 0;
  actualizarBotonAgregar(esFormularioValido(monto, categoriaElegida));
}

function manejarAgregarTransaccion() {
  const monto = Number(inputMonto.value) || 0;
  if (!esFormularioValido(monto, categoriaElegida)) {
    return;
  }

  if (transaccionEditandoId) {
    transacciones = actualizarTransaccion(transacciones, transaccionEditandoId, {
      tipo: tipoTransaccionActual,
      monto,
      categoria: categoriaElegida,
      descripcion: categoriaElegida,
    });
    transaccionEditandoId = null;
  } else {
    transacciones.unshift(crearTransaccion(tipoTransaccionActual, monto, categoriaElegida));
  }

  const seGuardo = guardarTransacciones(transacciones);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }

  actualizarPantalla();
  cerrarSheetCarga();
}

function manejarBorrarTransaccion() {
  if (!transaccionEditandoId) {
    return;
  }

  transacciones = quitarTransaccionPorId(transacciones, transaccionEditandoId);
  transaccionEditandoId = null;

  const seGuardo = guardarTransacciones(transacciones);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }

  actualizarPantalla();
  cerrarSheetCarga();
}

iniciarAplicacion();
