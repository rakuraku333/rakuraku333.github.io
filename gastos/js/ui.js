// Funciones que tocan el DOM: leer formularios, dibujar lista, totales y mensajes.
// Este archivo no calcula reglas de negocio ni guarda datos.

const formularioGasto = document.getElementById('formulario-gasto');
const campoMonto = document.getElementById('campo-monto');
const campoCategoria = document.getElementById('campo-categoria');
const campoFecha = document.getElementById('campo-fecha');
const filtroDesde = document.getElementById('filtro-desde');
const filtroHasta = document.getElementById('filtro-hasta');
const botonLimpiarFiltros = document.getElementById('boton-limpiar-filtros');
const elementoMensaje = document.getElementById('mensaje');
const notaFiltro = document.getElementById('nota-filtro');
const elementoTotalGeneral = document.getElementById('total-general');
const listaTotalesCategoria = document.getElementById('lista-totales-categoria');
const avisoListaVacia = document.getElementById('aviso-lista-vacia');
const tablaGastos = document.getElementById('tabla-gastos');
const cuerpoTablaGastos = document.getElementById('cuerpo-tabla-gastos');

const CLASE_BOTON_ELIMINAR = 'boton-eliminar';

const formateadorMoneda = new Intl.NumberFormat(LOCALE_MONEDA, {
  style: 'currency',
  currency: CODIGO_MONEDA,
});

function formatearMonto(monto) {
  return formateadorMoneda.format(monto);
}

function formatearFecha(fechaIso) {
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}

function rellenarSelectCategorias() {
  const opcionVacia = document.createElement('option');
  opcionVacia.value = '';
  opcionVacia.textContent = OPCION_CATEGORIA_VACIA;
  campoCategoria.appendChild(opcionVacia);

  for (const categoria of CATEGORIAS) {
    const opcion = document.createElement('option');
    opcion.value = categoria;
    opcion.textContent = categoria;
    campoCategoria.appendChild(opcion);
  }
}

function establecerFechaPorDefecto(fecha) {
  campoFecha.value = fecha;
}

function leerFormularioGasto() {
  return {
    monto: campoMonto.value === '' ? NaN : Number(campoMonto.value),
    categoria: campoCategoria.value,
    fecha: campoFecha.value,
  };
}

function limpiarFormularioGasto() {
  campoMonto.value = '';
  campoCategoria.value = '';
  // La fecha no se limpia: lo habitual es cargar varios gastos del mismo día.
}

function leerFiltros() {
  return { desde: filtroDesde.value, hasta: filtroHasta.value };
}

function limpiarFiltros() {
  filtroDesde.value = '';
  filtroHasta.value = '';
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

function crearBotonEliminar(idGasto) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = CLASE_BOTON_ELIMINAR;
  boton.dataset.idGasto = idGasto;
  boton.textContent = 'Eliminar';
  return boton;
}

function crearFilaGasto(gasto) {
  const fila = document.createElement('tr');

  const celdaFecha = document.createElement('td');
  celdaFecha.textContent = formatearFecha(gasto.fecha);

  const celdaCategoria = document.createElement('td');
  celdaCategoria.textContent = gasto.categoria;

  const celdaMonto = document.createElement('td');
  celdaMonto.className = 'alinear-derecha';
  celdaMonto.textContent = formatearMonto(gasto.monto);

  const celdaAcciones = document.createElement('td');
  celdaAcciones.className = 'alinear-derecha';
  celdaAcciones.appendChild(crearBotonEliminar(gasto.id));

  fila.append(celdaFecha, celdaCategoria, celdaMonto, celdaAcciones);
  return fila;
}

function renderizarListaGastos(gastos) {
  cuerpoTablaGastos.innerHTML = '';
  for (const gasto of gastos) {
    cuerpoTablaGastos.appendChild(crearFilaGasto(gasto));
  }
  tablaGastos.hidden = gastos.length === 0;
}

function mostrarAvisoListaVacia(texto) {
  avisoListaVacia.textContent = texto;
  avisoListaVacia.hidden = false;
}

function ocultarAvisoListaVacia() {
  avisoListaVacia.hidden = true;
}

function renderizarTotales(totalGeneral, totalesPorCategoria) {
  elementoTotalGeneral.textContent = formatearMonto(totalGeneral);

  listaTotalesCategoria.innerHTML = '';
  for (const [categoria, total] of Object.entries(totalesPorCategoria)) {
    const item = document.createElement('li');
    const nombre = document.createElement('span');
    nombre.textContent = categoria;
    const monto = document.createElement('strong');
    monto.textContent = formatearMonto(total);
    item.append(nombre, monto);
    listaTotalesCategoria.appendChild(item);
  }
}

function mostrarNotaDeFiltro(hayFiltroActivo) {
  notaFiltro.hidden = !hayFiltroActivo;
}

/* Registro de eventos: main.js decide QUÉ hacer; acá solo se conecta el CUÁNDO. */

function registrarEnvioDeFormulario(manejador) {
  formularioGasto.addEventListener('submit', evento => {
    evento.preventDefault();
    manejador();
  });
}

function registrarCambioDeFiltros(manejador) {
  filtroDesde.addEventListener('change', manejador);
  filtroHasta.addEventListener('change', manejador);
}

function registrarLimpiezaDeFiltros(manejador) {
  botonLimpiarFiltros.addEventListener('click', manejador);
}

function registrarEliminacionDeGasto(manejador) {
  // Un solo listener en la tabla alcanza para todos los botones "Eliminar" (delegación).
  cuerpoTablaGastos.addEventListener('click', evento => {
    const boton = evento.target.closest(`.${CLASE_BOTON_ELIMINAR}`);
    if (boton !== null) {
      manejador(boton.dataset.idGasto);
    }
  });
}
