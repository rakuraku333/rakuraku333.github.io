// Punto de entrada: lee las transacciones guardadas y conecta storage, lógica y ui.

let transacciones = [];
let tipoTransaccionActual = 'egreso';
let categoriaElegida = null;

function iniciarAplicacion() {
  const transaccionesGuardadas = leerTransacciones();
  if (transaccionesGuardadas === null) {
    transacciones = [];
    mostrarMensajeError(MENSAJES.errorLeer);
  } else {
    transacciones = transaccionesGuardadas;
  }

  actualizarPantalla();

  botonFab.addEventListener('click', manejarAperturaSheet);

  for (const boton of botonesSegmented) {
    boton.addEventListener('click', () => manejarCambioTipo(boton.dataset.tipo));
  }

  inputMonto.addEventListener('input', manejarInputMonto);

  botonAgregar.addEventListener('click', manejarAgregarTransaccion);

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
  renderizarTransaccionesRecientes(transacciones);
}

function manejarAperturaSheet() {
  tipoTransaccionActual = 'egreso';
  categoriaElegida = null;
  renderizarChipsCategoria(categoriaElegida, manejarSeleccionCategoria);
  abrirSheetCarga();
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

  transacciones.unshift(crearTransaccion(tipoTransaccionActual, monto, categoriaElegida));

  const seGuardo = guardarTransacciones(transacciones);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }

  actualizarPantalla();
  cerrarSheetCarga();
}

iniciarAplicacion();
