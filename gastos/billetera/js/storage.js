// Guardar y leer las transacciones en localStorage. Este archivo no sabe nada del DOM ni de la lógica.

// Devuelve el array de transacciones guardadas:
// - [] si todavía no hay nada guardado,
// - null si hubo un error al leer (el que llama decide qué mostrarle al usuario).
function leerTransacciones() {
  try {
    const textoGuardado = localStorage.getItem(CLAVE_STORAGE_TRANSACCIONES);
    if (textoGuardado === null) {
      return [];
    }
    const transaccionesGuardadas = JSON.parse(textoGuardado);
    return Array.isArray(transaccionesGuardadas) ? transaccionesGuardadas : [];
  } catch (error) {
    console.error('Error al leer las transacciones guardadas:', error);
    return null;
  }
}

// Guarda el array completo de transacciones. Devuelve true si salió bien, false si falló
// (por ejemplo, si el navegador bloquea localStorage o se quedó sin espacio).
function guardarTransacciones(transacciones) {
  try {
    localStorage.setItem(CLAVE_STORAGE_TRANSACCIONES, JSON.stringify(transacciones));
    return true;
  } catch (error) {
    console.error('Error al guardar las transacciones:', error);
    return false;
  }
}
