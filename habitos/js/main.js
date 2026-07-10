// Punto de entrada: mantiene los hábitos en memoria y conecta storage, lógica y ui.

let habitos = [];

function iniciarAplicacion() {
  const habitosGuardados = leerHabitos();
  if (habitosGuardados === null) {
    habitos = [];
    mostrarMensajeError(MENSAJES.errorLeer);
  } else {
    habitos = habitosGuardados;
  }

  registrarEnvioDeFormulario(manejarNuevoHabito);
  registrarAlternarHoy(manejarAlternarHoy);
  registrarEliminacionDeHabito(manejarEliminacionDeHabito);

  actualizarPantalla();
}

function manejarNuevoHabito() {
  ocultarMensaje();

  const nombre = leerFormularioHabito();
  const mensajeDeError = validarNuevoHabito(nombre, habitos);
  if (mensajeDeError !== null) {
    mostrarMensajeError(mensajeDeError);
    return;
  }

  habitos.push(crearHabito(nombre));
  guardarCambios();
  limpiarFormularioHabito();
  actualizarPantalla();
}

function manejarAlternarHoy(idHabito) {
  ocultarMensaje();

  const habito = buscarHabitoPorId(habitos, idHabito);
  if (habito === null) {
    return;
  }

  habito.diasCompletados = alternarDia(habito.diasCompletados, obtenerFechaDeHoy());
  guardarCambios();
  actualizarPantalla();
}

function manejarEliminacionDeHabito(idHabito) {
  ocultarMensaje();
  habitos = quitarHabitoPorId(habitos, idHabito);
  guardarCambios();
  actualizarPantalla();
}

function guardarCambios() {
  const seGuardo = guardarHabitos(habitos);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }
}

function actualizarPantalla() {
  const fechaHoy = obtenerFechaDeHoy();
  const resumenes = habitos.map(habito => armarResumenDeHabito(habito, fechaHoy));

  renderizarListaHabitos(resumenes);
  if (resumenes.length === 0) {
    mostrarAvisoSinHabitos(MENSAJES.sinHabitos);
  } else {
    ocultarAvisoSinHabitos();
  }
}

iniciarAplicacion();
