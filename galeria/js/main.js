// Punto de entrada: mantiene las imágenes en memoria y conecta storage, lógica y ui.

let imagenes = [];

function iniciarAplicacion() {
  rellenarSelectEtiquetas();

  const imagenesGuardadas = leerImagenes();
  if (imagenesGuardadas === null) {
    imagenes = [];
    mostrarMensajeError(MENSAJES.errorLeer);
  } else {
    imagenes = imagenesGuardadas;
  }

  registrarEnvioDeFormulario(manejarNuevaImagen);
  registrarAperturaDeImagen(manejarAperturaDeImagen);
  registrarCierreDeDialogo();
  registrarEliminacionDeImagen(manejarEliminacionDeImagen);

  actualizarPantalla();
}

// Es async porque leer un archivo del disco no es instantáneo: el await espera
// a que el navegador termine de convertirlo sin congelar la página.
async function manejarNuevaImagen() {
  ocultarMensaje();

  const datos = leerFormularioImagen();
  const mensajeDeError = validarNuevaImagen(datos);
  if (mensajeDeError !== null) {
    mostrarMensajeError(mensajeDeError);
    return;
  }

  let urlImagen = datos.url.trim();
  if (datos.archivo !== null) {
    try {
      urlImagen = await leerArchivoComoDataUrl(datos.archivo);
    } catch (error) {
      console.error('Error al leer el archivo elegido:', error);
      mostrarMensajeError(MENSAJES.archivoIlegible);
      return;
    }
  }

  imagenes.push(crearImagen(urlImagen, datos.titulo, datos.etiqueta));
  guardarCambios();
  limpiarFormularioImagen();
  actualizarPantalla();
}

function manejarAperturaDeImagen(idImagen) {
  const imagen = buscarImagenPorId(imagenes, idImagen);
  if (imagen === null) {
    return;
  }
  abrirDialogo(imagen);
}

function manejarEliminacionDeImagen(idImagen) {
  ocultarMensaje();
  imagenes = quitarImagenPorId(imagenes, idImagen);
  guardarCambios();
  cerrarDialogo();
  actualizarPantalla();
}

function guardarCambios() {
  const seGuardo = guardarImagenes(imagenes);
  if (!seGuardo) {
    mostrarMensajeError(MENSAJES.errorGuardar);
  }
}

function actualizarPantalla() {
  const imagenesOrdenadas = ordenarPorCreacionDescendente(imagenes);
  renderizarGrilla(imagenesOrdenadas);
  if (imagenesOrdenadas.length === 0) {
    mostrarAvisoSinImagenes(MENSAJES.sinImagenes);
  } else {
    ocultarAvisoSinImagenes();
  }
}

iniciarAplicacion();
