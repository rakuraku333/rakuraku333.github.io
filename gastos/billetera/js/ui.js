// Funciones que tocan el DOM: dibujar saldo, resumen, deuda y lista de transacciones.
// Este archivo no calcula reglas de negocio ni guarda datos.

const elementoMensaje = document.getElementById('mensaje');
const elementoSaldoTotal = document.getElementById('saldo-total');
const elementoResumenIngresos = document.getElementById('resumen-ingresos');
const elementoResumenEgresos = document.getElementById('resumen-egresos');
const elementoDeudaNombre = document.getElementById('deuda-nombre');
const elementoDeudaMonto = document.getElementById('deuda-monto');
const elementoDeudaBarraRelleno = document.getElementById('deuda-barra-relleno');
const elementoDeudaProximaCuota = document.getElementById('deuda-proxima-cuota');
const avisoTransaccionesVacio = document.getElementById('aviso-transacciones-vacio');
const listaTransacciones = document.getElementById('lista-transacciones');
const avisoMovimientosVacio = document.getElementById('aviso-movimientos-vacio');
const listaMovimientos = document.getElementById('lista-movimientos');
const pantallaInicio = document.querySelector('.pantalla-billetera');
const pantallaMovimientos = document.getElementById('pantalla-movimientos');
const tabInicio = document.getElementById('tab-inicio');
const tabMovimientos = document.getElementById('tab-movimientos');
const botonFab = document.getElementById('boton-fab');
const dialogoSheetCarga = document.getElementById('sheet-carga');
const botonesSegmented = document.querySelectorAll('.segmented-opcion');
const inputMonto = document.getElementById('input-monto');
const contenedorChipsCategoria = document.getElementById('chips-categoria');
const botonAgregar = document.getElementById('boton-agregar');
const botonBorrar = document.getElementById('boton-borrar');

const formateadorMoneda = new Intl.NumberFormat(LOCALE_MONEDA, {
  style: 'currency',
  currency: CODIGO_MONEDA,
  maximumFractionDigits: 0,
});

function formatearMonto(monto) {
  return formateadorMoneda.format(monto);
}

function renderizarSaldo(saldoTotal) {
  elementoSaldoTotal.textContent = formatearMonto(saldoTotal);
}

function renderizarResumenIngresoEgreso(totalIngresos, totalEgresos) {
  elementoResumenIngresos.textContent = `+${formatearMonto(totalIngresos)}`;
  elementoResumenEgresos.textContent = `-${formatearMonto(totalEgresos)}`;
}

function renderizarDeuda(deuda, porcentaje) {
  elementoDeudaNombre.textContent = deuda.nombre;
  elementoDeudaMonto.textContent = `${formatearMonto(deuda.montoPagado)} de ${formatearMonto(deuda.montoTotal)}`;
  elementoDeudaBarraRelleno.style.width = `${porcentaje}%`;
  elementoDeudaProximaCuota.textContent = `Próxima cuota: ${deuda.proximaCuota}`;
}

function crearFilaTransaccion(transaccion, etiquetaFecha, onClickTransaccion) {
  const fila = document.createElement('li');
  fila.className = 'fila-transaccion';

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-fila-transaccion';
  boton.addEventListener('click', () => onClickTransaccion(transaccion.id));

  const icono = document.createElement('span');
  icono.className = 'icono-transaccion';
  icono.setAttribute('aria-hidden', 'true');
  icono.textContent = obtenerIconoCategoria(transaccion.categoria);

  const detalle = document.createElement('div');
  detalle.className = 'detalle-transaccion';

  const descripcion = document.createElement('p');
  descripcion.className = 'descripcion-transaccion';
  descripcion.textContent = transaccion.descripcion;

  const caption = document.createElement('p');
  caption.className = 'caption-transaccion';
  caption.textContent = `${transaccion.categoria} · ${etiquetaFecha}`;

  detalle.append(descripcion, caption);

  const monto = document.createElement('span');
  const esIngreso = transaccion.tipo === 'ingreso';
  monto.className = `monto-transaccion ${esIngreso ? 'resumen-ingreso' : 'resumen-egreso'}`;
  monto.textContent = `${esIngreso ? '+' : '-'}${formatearMonto(transaccion.monto)}`;

  boton.append(icono, detalle, monto);
  fila.appendChild(boton);
  return fila;
}

function renderizarListaTransacciones(transacciones, listaElemento, avisoElemento, onClickTransaccion) {
  listaElemento.innerHTML = '';

  if (transacciones.length === 0) {
    listaElemento.hidden = true;
    avisoElemento.textContent = MENSAJES.listaVacia;
    avisoElemento.hidden = false;
    return;
  }

  avisoElemento.hidden = true;
  listaElemento.hidden = false;

  const hoyIso = obtenerFechaDeHoy();
  for (const transaccion of transacciones) {
    const etiquetaFecha = obtenerEtiquetaFecha(transaccion.fecha, hoyIso);
    listaElemento.appendChild(crearFilaTransaccion(transaccion, etiquetaFecha, onClickTransaccion));
  }
}

function renderizarTransaccionesRecientes(transacciones, onClickTransaccion) {
  renderizarListaTransacciones(transacciones, listaTransacciones, avisoTransaccionesVacio, onClickTransaccion);
}

function renderizarMovimientos(transacciones, onClickTransaccion) {
  renderizarListaTransacciones(transacciones, listaMovimientos, avisoMovimientosVacio, onClickTransaccion);
}

function mostrarMensajeError(texto) {
  elementoMensaje.textContent = texto;
  elementoMensaje.classList.add('mensaje-error');
  elementoMensaje.hidden = false;
}

function crearChipCategoria(categoria, seleccionada, onSeleccionar) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = seleccionada ? 'chip seleccionada' : 'chip';
  chip.textContent = `${obtenerIconoCategoria(categoria)} ${categoria}`;
  chip.addEventListener('click', () => onSeleccionar(categoria));
  return chip;
}

function renderizarChipsCategoria(categoriaSeleccionada, onSeleccionar) {
  contenedorChipsCategoria.innerHTML = '';
  for (const categoria of Object.keys(ICONOS_CATEGORIA)) {
    const seleccionada = categoria === categoriaSeleccionada;
    contenedorChipsCategoria.appendChild(crearChipCategoria(categoria, seleccionada, onSeleccionar));
  }
}

function actualizarSegmented(tipo) {
  for (const boton of botonesSegmented) {
    boton.classList.toggle('activa', boton.dataset.tipo === tipo);
  }
}

function actualizarColorMonto(tipo) {
  inputMonto.classList.toggle('color-egreso', tipo === 'egreso');
  inputMonto.classList.toggle('color-ingreso', tipo === 'ingreso');
}

function actualizarTamanoMonto() {
  const cantidadDigitos = inputMonto.value.length;
  inputMonto.classList.toggle('monto-mediano', cantidadDigitos > 6 && cantidadDigitos <= 8);
  inputMonto.classList.toggle('monto-chico', cantidadDigitos > 8);
}

function actualizarBotonAgregar(habilitado) {
  botonAgregar.disabled = !habilitado;
}

function abrirSheetCarga(transaccion) {
  const esEdicion = !!transaccion;
  const tipo = esEdicion ? transaccion.tipo : 'egreso';
  actualizarSegmented(tipo);
  inputMonto.value = esEdicion ? String(transaccion.monto) : '';
  actualizarColorMonto(tipo);
  actualizarTamanoMonto();
  actualizarBotonAgregar(esEdicion);
  botonAgregar.textContent = esEdicion ? 'Guardar cambios' : 'Agregar';
  botonBorrar.hidden = !esEdicion;
  dialogoSheetCarga.showModal();
}

function mostrarPantalla(pantalla) {
  const esInicio = pantalla === 'inicio';
  pantallaInicio.hidden = !esInicio;
  pantallaMovimientos.hidden = esInicio;

  tabInicio.classList.toggle('tab-nav-activo', esInicio);
  tabMovimientos.classList.toggle('tab-nav-activo', !esInicio);
  if (esInicio) {
    tabInicio.setAttribute('aria-current', 'page');
    tabMovimientos.removeAttribute('aria-current');
  } else {
    tabMovimientos.setAttribute('aria-current', 'page');
    tabInicio.removeAttribute('aria-current');
  }
}

function cerrarSheetCarga() {
  dialogoSheetCarga.close();
}
