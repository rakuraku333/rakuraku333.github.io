// Guardar y leer los gastos en localStorage. Este archivo no sabe nada del DOM ni de la lógica.

// Devuelve el array de gastos guardados:
// - [] si todavía no hay nada guardado,
// - null si hubo un error al leer (el que llama decide qué mostrarle al usuario).
function leerGastos() {
  try {
    const textoGuardado = localStorage.getItem(CLAVE_STORAGE_GASTOS);
    if (textoGuardado === null) {
      return [];
    }
    const gastosGuardados = JSON.parse(textoGuardado);
    return Array.isArray(gastosGuardados) ? gastosGuardados : [];
  } catch (error) {
    console.error('Error al leer los gastos guardados:', error);
    return null;
  }
}

// Guarda el array completo de gastos. Devuelve true si salió bien, false si falló
// (por ejemplo, si el navegador bloquea localStorage o se quedó sin espacio).
function guardarGastos(gastos) {
  try {
    localStorage.setItem(CLAVE_STORAGE_GASTOS, JSON.stringify(gastos));
    return true;
  } catch (error) {
    console.error('Error al guardar los gastos:', error);
    return false;
  }
}
