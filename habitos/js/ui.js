// Funciones que tocan el DOM: leer el formulario, dibujar la lista de hábitos y mensajes.
// Este archivo no calcula reglas de negocio ni guarda datos.

const formularioHabito = document.getElementById('formulario-habito');
const campoNombre = document.getElementById('campo-nombre');
const elementoMensaje = document.getElementById('mensaje');
const avisoSinHabitos = document.getElementById('aviso-sin-habitos');
const listaHabitos = document.getElementById('lista-habitos');

const CLASE_BOTON_HOY = 'boton-hoy';
const CLASE_BOTON_ELIMINAR = 'boton-eliminar';

function formatearRacha(cantidadDeDias) {
  return cantidadDeDias === 1 ? '1 día' : `${cantidadDeDias} días`;
}

function leerFormularioHabito() {
  return campoNombre.value;
}

function limpiarFormularioHabito() {
  campoNombre.value = '';
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

function crearBotonDeHoy(resumen) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = CLASE_BOTON_HOY;
  boton.dataset.idHabito = resumen.id;
  boton.setAttribute('aria-pressed', String(resumen.completadoHoy));
  boton.textContent = resumen.completadoHoy ? 'Hoy ✓' : 'Hoy';
  return boton;
}

function crearBotonEliminar(idHabito) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = CLASE_BOTON_ELIMINAR;
  boton.dataset.idHabito = idHabito;
  boton.textContent = 'Eliminar';
  return boton;
}

function crearItemDeHabito(resumen) {
  const item = document.createElement('li');

  const informacion = document.createElement('div');
  informacion.className = 'info-habito';

  const nombre = document.createElement('span');
  nombre.className = 'nombre-habito';
  nombre.textContent = resumen.nombre;

  const detalle = document.createElement('span');
  detalle.className = 'detalle-racha';
  detalle.textContent =
    `Racha: ${formatearRacha(resumen.rachaActual)} · Mejor: ${formatearRacha(resumen.mejorRacha)}`;

  informacion.append(nombre, detalle);
  item.append(crearBotonDeHoy(resumen), informacion, crearBotonEliminar(resumen.id));
  return item;
}

function renderizarListaHabitos(resumenes) {
  listaHabitos.innerHTML = '';
  for (const resumen of resumenes) {
    listaHabitos.appendChild(crearItemDeHabito(resumen));
  }
  listaHabitos.hidden = resumenes.length === 0;
}

function mostrarAvisoSinHabitos(texto) {
  avisoSinHabitos.textContent = texto;
  avisoSinHabitos.hidden = false;
}

function ocultarAvisoSinHabitos() {
  avisoSinHabitos.hidden = true;
}

/* Registro de eventos: main.js decide QUÉ hacer; acá solo se conecta el CUÁNDO. */

function registrarEnvioDeFormulario(manejador) {
  formularioHabito.addEventListener('submit', evento => {
    evento.preventDefault();
    manejador();
  });
}

// Un solo listener en la lista alcanza para todos los botones (delegación).
function registrarAlternarHoy(manejador) {
  listaHabitos.addEventListener('click', evento => {
    const boton = evento.target.closest(`.${CLASE_BOTON_HOY}`);
    if (boton !== null) {
      manejador(boton.dataset.idHabito);
    }
  });
}

function registrarEliminacionDeHabito(manejador) {
  listaHabitos.addEventListener('click', evento => {
    const boton = evento.target.closest(`.${CLASE_BOTON_ELIMINAR}`);
    if (boton !== null) {
      manejador(boton.dataset.idHabito);
    }
  });
}
