// Punto de entrada: junta las entradas publicadas (datos del repo) con los borradores
// (localStorage) y conecta storage, lógica y ui.

// Publicadas: acá son solo lectura; se cambian editando datos/entradas-publicadas.js.
let entradasPublicadas = [];
// Borradores: lo único que este navegador puede crear, guardar y eliminar.
let borradores = [];

function iniciarAplicacion() {
  entradasPublicadas = leerEntradasPublicadas();

  const borradoresGuardados = leerEntradas();
  if (borradoresGuardados === null) {
    borradores = [];
    mostrarMensajeError(MENSAJES.errorLeer);
  } else {
    borradores = borradoresGuardados;
  }

  limpiarBorradoresYaPublicados();

  registrarEnvioDeFormulario(manejarNuevaEntrada);
  registrarCambioDeRuta(manejarCambioDeRuta);
  registrarEliminacionDeEntrada(manejarEliminacionDeEntrada);
  registrarExportacion(manejarExportacion);

  // Dibuja la vista que corresponda al hash actual (sirve también si se entra
  // directo con un link a una entrada, por ejemplo desde la bitácora de la landing).
  manejarCambioDeRuta();
}

// El archivo de publicadas puede faltar (repo recién clonado, script que no cargó):
// en ese caso el blog funciona igual, solo con los borradores locales.
function leerEntradasPublicadas() {
  if (typeof ENTRADAS_PUBLICADAS === 'undefined' || !Array.isArray(ENTRADAS_PUBLICADAS)) {
    return [];
  }
  return ENTRADAS_PUBLICADAS;
}

// Si un borrador ya aparece publicado (se exportó y commiteó), acá termina su ciclo:
// se saca de localStorage para que no quede duplicado en el listado.
function limpiarBorradoresYaPublicados() {
  const borradoresVigentes = quitarBorradoresYaPublicados(entradasPublicadas, borradores);
  if (borradoresVigentes.length !== borradores.length) {
    borradores = borradoresVigentes;
    guardarCambios();
  }
}

function todasLasEntradas() {
  return [...entradasPublicadas, ...borradores];
}

function esBorrador(idEntrada) {
  return buscarEntradaPorId(borradores, idEntrada) !== null;
}

function manejarNuevaEntrada() {
  ocultarMensaje();

  const datosDelFormulario = leerFormularioEntrada();
  const mensajeDeError = validarNuevaEntrada(datosDelFormulario);
  if (mensajeDeError !== null) {
    mostrarMensajeError(mensajeDeError);
    return;
  }

  const nuevoBorrador = crearEntrada(datosDelFormulario.titulo, datosDelFormulario.contenido);
  borradores.push(nuevoBorrador);

  guardarCambios();
  limpiarFormularioEntrada();
  actualizarLista();
}

function manejarEliminacionDeEntrada(idEntrada) {
  ocultarMensaje();
  if (!esBorrador(idEntrada)) {
    mostrarMensajeError(MENSAJES.soloBorradoresSeEliminan);
    return;
  }
  borradores = quitarEntradaPorId(borradores, idEntrada);
  guardarCambios();
  navegarALista();
}

// Genera y descarga datos/entradas-publicadas.js con TODO lo visible (publicadas +
// borradores): reemplazar ese archivo en el repo y commitear es publicar.
function manejarExportacion() {
  ocultarMensaje();
  const entradas = ordenarPorCreacionDescendente(todasLasEntradas());
  if (entradas.length === 0) {
    mostrarMensajeError(MENSAJES.nadaParaExportar);
    return;
  }
  descargarArchivo(NOMBRE_ARCHIVO_PUBLICADAS, generarArchivoPublicadas(entradas));
  mostrarMensajeInformativo(MENSAJES.exportacionLista);
}

function guardarCambios() {
  const seGuardo = guardarEntradas(borradores);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }
}

// Muestra la vista que indica la URL: listado (sin hash) o detalle ("#entrada/<id>").
function manejarCambioDeRuta() {
  const idEntrada = extraerIdDeHash(leerHashActual());

  if (idEntrada === null) {
    actualizarLista();
    mostrarVistaLista();
    return;
  }

  const entrada = buscarEntradaPorId(todasLasEntradas(), idEntrada);
  if (entrada === null) {
    mostrarMensajeError(MENSAJES.entradaNoEncontrada);
    navegarALista();
    return;
  }

  renderizarDetalle(entrada, esBorrador(entrada.id));
  mostrarVistaDetalle();
}

function actualizarLista() {
  const entradasOrdenadas = ordenarPorCreacionDescendente(todasLasEntradas());
  const idsBorradores = new Set(borradores.map(borrador => borrador.id));
  renderizarListaEntradas(entradasOrdenadas, idsBorradores);
  if (entradasOrdenadas.length === 0) {
    mostrarAvisoSinEntradas(MENSAJES.sinEntradas);
  } else {
    ocultarAvisoSinEntradas();
  }
}

iniciarAplicacion();
