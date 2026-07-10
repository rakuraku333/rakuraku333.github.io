// Funciones que tocan el DOM y la URL: leer el formulario, dibujar listado y detalle,
// mostrar mensajes y navegar entre vistas. No calcula reglas de negocio ni guarda datos.

const formularioEntrada = document.getElementById('formulario-entrada');
const campoTitulo = document.getElementById('campo-titulo');
const campoContenido = document.getElementById('campo-contenido');
const elementoMensaje = document.getElementById('mensaje');
const vistaLista = document.getElementById('vista-lista');
const vistaDetalle = document.getElementById('vista-detalle');
const avisoSinEntradas = document.getElementById('aviso-sin-entradas');
const listaEntradas = document.getElementById('lista-entradas');
const detalleTitulo = document.getElementById('detalle-titulo');
const detalleFecha = document.getElementById('detalle-fecha');
const detalleContenido = document.getElementById('detalle-contenido');
const botonEliminarEntrada = document.getElementById('boton-eliminar-entrada');
const botonExportar = document.getElementById('boton-exportar');
const notaEntradaPublicada = document.getElementById('detalle-nota-publicada');

function leerFormularioEntrada() {
  return {
    titulo: campoTitulo.value,
    contenido: campoContenido.value,
  };
}

function limpiarFormularioEntrada() {
  campoTitulo.value = '';
  campoContenido.value = '';
}

function mostrarMensajeError(texto) {
  elementoMensaje.textContent = texto;
  elementoMensaje.classList.add('mensaje-error');
  elementoMensaje.hidden = false;
}

function mostrarMensajeInformativo(texto) {
  elementoMensaje.textContent = texto;
  elementoMensaje.classList.remove('mensaje-error');
  elementoMensaje.hidden = false;
}

function ocultarMensaje() {
  elementoMensaje.hidden = true;
  elementoMensaje.textContent = '';
  elementoMensaje.classList.remove('mensaje-error');
}

function crearItemDeEntrada(entrada, esBorrador) {
  const item = document.createElement('li');

  const grupoTitulo = document.createElement('span');
  grupoTitulo.className = 'titulo-con-etiqueta';

  const enlace = document.createElement('a');
  enlace.href = PREFIJO_HASH_ENTRADA + entrada.id;
  enlace.textContent = entrada.titulo;
  grupoTitulo.appendChild(enlace);

  if (esBorrador) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-borrador';
    etiqueta.textContent = TEXTO_ETIQUETA_BORRADOR;
    grupoTitulo.appendChild(etiqueta);
  }

  const fecha = document.createElement('span');
  fecha.className = 'fecha-entrada';
  fecha.textContent = formatearFecha(entrada.fechaCreacion);

  item.append(grupoTitulo, fecha);
  return item;
}

function renderizarListaEntradas(entradas, idsBorradores) {
  listaEntradas.innerHTML = '';
  for (const entrada of entradas) {
    listaEntradas.appendChild(crearItemDeEntrada(entrada, idsBorradores.has(entrada.id)));
  }
  listaEntradas.hidden = entradas.length === 0;
}

function mostrarAvisoSinEntradas(texto) {
  avisoSinEntradas.textContent = texto;
  avisoSinEntradas.hidden = false;
}

function ocultarAvisoSinEntradas() {
  avisoSinEntradas.hidden = true;
}

function renderizarDetalle(entrada, esBorrador) {
  detalleTitulo.textContent = entrada.titulo;
  detalleFecha.textContent = formatearFecha(entrada.fechaCreacion);
  detalleContenido.innerHTML = formatearContenido(entrada.contenido);
  botonEliminarEntrada.dataset.idEntrada = entrada.id;
  // Las publicadas no se eliminan desde el navegador: se editan en el repo.
  botonEliminarEntrada.hidden = !esBorrador;
  notaEntradaPublicada.hidden = esBorrador;
}

function mostrarVistaLista() {
  vistaLista.hidden = false;
  vistaDetalle.hidden = true;
}

function mostrarVistaDetalle() {
  vistaLista.hidden = true;
  vistaDetalle.hidden = false;
}

function leerHashActual() {
  return location.hash;
}

function navegarALista() {
  location.hash = '';
}

// Descarga un archivo de texto generado en memoria (sin servidor de por medio).
function descargarArchivo(nombreArchivo, contenido) {
  const blob = new Blob([contenido], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

/* Registro de eventos: main.js decide QUÉ hacer; acá solo se conecta el CUÁNDO. */

function registrarEnvioDeFormulario(manejador) {
  formularioEntrada.addEventListener('submit', evento => {
    evento.preventDefault();
    manejador();
  });
}

function registrarCambioDeRuta(manejador) {
  window.addEventListener('hashchange', manejador);
}

function registrarEliminacionDeEntrada(manejador) {
  botonEliminarEntrada.addEventListener('click', () => {
    manejador(botonEliminarEntrada.dataset.idEntrada);
  });
}

function registrarExportacion(manejador) {
  botonExportar.addEventListener('click', manejador);
}
