// Reglas de negocio: validaciones, fechas y cálculo de rachas.
// Este archivo no toca el DOM ni localStorage.

// Devuelve el mensaje del primer error encontrado, o null si el nombre es válido.
function validarNuevoHabito(nombre, habitosExistentes) {
  const nombreLimpio = nombre.trim();

  if (nombreLimpio === '') {
    return MENSAJES.nombreVacio;
  }
  if (nombreLimpio.length > NOMBRE_MAXIMO) {
    return MENSAJES.nombreLargo;
  }
  if (esNombreDuplicado(nombreLimpio, habitosExistentes)) {
    return MENSAJES.nombreDuplicado;
  }
  return null;
}

function esNombreDuplicado(nombre, habitos) {
  return habitos.some(habito => habito.nombre.toLowerCase() === nombre.toLowerCase());
}

function crearIdUnico() {
  // Date.now() solo no alcanza: dos hábitos en el mismo milisegundo repetirían id.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function crearHabito(nombre) {
  return {
    id: crearIdUnico(),
    nombre: nombre.trim(),
    fechaCreacion: obtenerFechaDeHoy(),
    diasCompletados: [],
  };
}

function buscarHabitoPorId(habitos, idHabito) {
  const habito = habitos.find(habito => habito.id === idHabito);
  return habito === undefined ? null : habito;
}

function quitarHabitoPorId(habitos, idHabito) {
  return habitos.filter(habito => habito.id !== idHabito);
}

// Agrega la fecha si no estaba, o la saca si ya estaba (des-marcar un día).
function alternarDia(diasCompletados, fecha) {
  if (diasCompletados.includes(fecha)) {
    return diasCompletados.filter(dia => dia !== fecha);
  }
  return [...diasCompletados, fecha];
}

// Racha actual: días seguidos hasta hoy inclusive. Si hoy todavía no se marcó,
// la racha se cuenta hasta ayer (marcar hoy la extiende, no la resetea).
function calcularRachaActual(diasCompletados, fechaHoy) {
  const dias = new Set(diasCompletados);
  let fecha = dias.has(fechaHoy) ? fechaHoy : restarUnDia(fechaHoy);
  let racha = 0;
  while (dias.has(fecha)) {
    racha = racha + 1;
    fecha = restarUnDia(fecha);
  }
  return racha;
}

// Mejor racha histórica: la corrida de días consecutivos más larga.
function calcularMejorRacha(diasCompletados) {
  const diasOrdenados = [...new Set(diasCompletados)].sort();
  let mejorRacha = 0;
  let rachaActual = 0;
  let diaAnterior = null;

  for (const dia of diasOrdenados) {
    const esConsecutivo = diaAnterior !== null && restarUnDia(dia) === diaAnterior;
    rachaActual = esConsecutivo ? rachaActual + 1 : 1;
    if (rachaActual > mejorRacha) {
      mejorRacha = rachaActual;
    }
    diaAnterior = dia;
  }
  return mejorRacha;
}

// Resume un hábito en lo que la pantalla necesita mostrar.
function armarResumenDeHabito(habito, fechaHoy) {
  return {
    id: habito.id,
    nombre: habito.nombre,
    rachaActual: calcularRachaActual(habito.diasCompletados, fechaHoy),
    mejorRacha: calcularMejorRacha(habito.diasCompletados),
    completadoHoy: habito.diasCompletados.includes(fechaHoy),
  };
}

function obtenerFechaDeHoy() {
  // Se arma a mano para usar la fecha local: toISOString() usa UTC y de noche puede dar otro día.
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Devuelve el día anterior a una fecha "AAAA-MM-DD". El constructor de Date
// ajusta solo los desbordes: el "día 0" de un mes es el último día del mes anterior.
function restarUnDia(fecha) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaAnterior = new Date(anio, mes - 1, dia - 1);
  const mesTexto = String(fechaAnterior.getMonth() + 1).padStart(2, '0');
  const diaTexto = String(fechaAnterior.getDate()).padStart(2, '0');
  return `${fechaAnterior.getFullYear()}-${mesTexto}-${diaTexto}`;
}
