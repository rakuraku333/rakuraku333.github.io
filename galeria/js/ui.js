// Funciones que tocan el DOM y el navegador: leer el formulario (incluido el archivo),
// dibujar la grilla, manejar el diálogo y los mensajes. No calcula reglas ni guarda datos.

const formularioImagen = document.getElementById('formulario-imagen');
const campoArchivo = document.getElementById('campo-archivo');
const campoUrl = document.getElementById('campo-url');
const campoTitulo = document.getElementById('campo-titulo');
const campoEtiqueta = document.getElementById('campo-etiqueta');
const elementoMensaje = document.getElementById('mensaje');
const avisoSinImagenes = document.getElementById('aviso-sin-imagenes');
const grillaImagenes = document.getElementById('grilla-imagenes');
const dialogoImagen = document.getElementById('dialogo-imagen');
const dialogoTitulo = document.getElementById('dialogo-titulo');
const dialogoImagenGrande = document.getElementById('dialogo-imagen-grande');
const dialogoDetalle = document.getElementById('dialogo-detalle');
const botonCerrarDialogo = document.getElementById('boton-cerrar-dialogo');
const botonEliminarImagen = document.getElementById('boton-eliminar-imagen');

const CLASE_MINIATURA = 'miniatura';

function formatearFecha(fechaCreacion) {
  // De "2026-07-09T14:30:05" muestra solo la fecha, como "09/07/2026".
  const [fecha] = fechaCreacion.split('T');
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function rellenarSelectEtiquetas() {
  const opcionVacia = document.createElement('option');
  opcionVacia.value = '';
  opcionVacia.textContent = OPCION_SIN_ETIQUETA;
  campoEtiqueta.appendChild(opcionVacia);

  for (const etiqueta of ETIQUETAS) {
    const opcion = document.createElement('option');
    opcion.value = etiqueta;
    opcion.textContent = etiqueta;
    campoEtiqueta.appendChild(opcion);
  }
}

function leerFormularioImagen() {
  const archivoElegido = campoArchivo.files[0];
  return {
    archivo: archivoElegido === undefined ? null : archivoElegido,
    url: campoUrl.value,
    titulo: campoTitulo.value,
    etiqueta: campoEtiqueta.value,
  };
}

function limpiarFormularioImagen() {
  campoArchivo.value = '';
  campoUrl.value = '';
  campoTitulo.value = '';
  campoEtiqueta.value = '';
}

// Convierte el archivo elegido en una data URL (la imagen como texto base64),
// que sirve como src de un <img> y se puede guardar en localStorage.
function leerArchivoComoDataUrl(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(archivo);
  });
}

function mostrarMensajeError(texto) {
  elementoMensaje.textContent = texto;
  elementoMensaje.classList.add('mensaje-error');
  elementoMensaje.hidden = false;
}

function ocultarMensaje() {
  elementoMensaje.hidden = true;
  elementoMensaje.textContent = '';
  elementoMensaje.classList.remove('mensaje-error');
}

function crearMiniatura(imagen) {
  const item = document.createElement('li');

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = CLASE_MINIATURA;
  boton.dataset.idImagen = imagen.id;

  const foto = document.createElement('img');
  foto.src = imagen.urlImagen;
  foto.alt = imagen.titulo;
  foto.loading = 'lazy';

  const pie = document.createElement('span');
  pie.className = 'pie-miniatura';

  const titulo = document.createElement('span');
  titulo.className = 'titulo-miniatura';
  titulo.textContent = imagen.titulo;
  pie.appendChild(titulo);

  if (imagen.etiqueta !== '') {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-imagen';
    etiqueta.textContent = imagen.etiqueta;
    pie.appendChild(etiqueta);
  }

  boton.append(foto, pie);
  item.appendChild(boton);
  return item;
}

function renderizarGrilla(imagenes) {
  grillaImagenes.innerHTML = '';
  for (const imagen of imagenes) {
    grillaImagenes.appendChild(crearMiniatura(imagen));
  }
  grillaImagenes.hidden = imagenes.length === 0;
}

function mostrarAvisoSinImagenes(texto) {
  avisoSinImagenes.textContent = texto;
  avisoSinImagenes.hidden = false;
}

function ocultarAvisoSinImagenes() {
  avisoSinImagenes.hidden = true;
}

function abrirDialogo(imagen) {
  dialogoTitulo.textContent = imagen.titulo;
  dialogoImagenGrande.src = imagen.urlImagen;
  dialogoImagenGrande.alt = imagen.titulo;

  const partes = [imagen.etiqueta, formatearFecha(imagen.fechaCreacion)];
  dialogoDetalle.textContent = partes.filter(parte => parte !== '').join(' · ');

  botonEliminarImagen.dataset.idImagen = imagen.id;
  dialogoImagen.showModal();
}

function cerrarDialogo() {
  dialogoImagen.close();
}

/* Registro de eventos: main.js decide QUÉ hacer; acá solo se conecta el CUÁNDO. */

function registrarEnvioDeFormulario(manejador) {
  formularioImagen.addEventListener('submit', evento => {
    evento.preventDefault();
    manejador();
  });
}

// Un solo listener en la grilla alcanza para todas las miniaturas (delegación).
function registrarAperturaDeImagen(manejador) {
  grillaImagenes.addEventListener('click', evento => {
    const boton = evento.target.closest(`.${CLASE_MINIATURA}`);
    if (boton !== null) {
      manejador(boton.dataset.idImagen);
    }
  });
}

function registrarCierreDeDialogo() {
  botonCerrarDialogo.addEventListener('click', cerrarDialogo);

  // Un click en el fondo oscuro (el propio <dialog>, no su contenido) también cierra.
  // La tecla Escape ya la maneja el navegador por ser un diálogo modal.
  dialogoImagen.addEventListener('click', evento => {
    if (evento.target === dialogoImagen) {
      cerrarDialogo();
    }
  });
}

function registrarEliminacionDeImagen(manejador) {
  botonEliminarImagen.addEventListener('click', () => {
    manejador(botonEliminarImagen.dataset.idImagen);
  });
}
