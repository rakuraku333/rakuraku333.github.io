// Guardar y leer las entradas en localStorage. Este archivo no sabe nada del DOM ni de la lógica.

// Devuelve el array de entradas guardadas:
// - [] si todavía no hay nada guardado,
// - null si hubo un error al leer (el que llama decide qué mostrarle al usuario).
function leerEntradas() {
  try {
    const textoGuardado = localStorage.getItem(CLAVE_STORAGE_ENTRADAS);
    if (textoGuardado === null) {
      return [];
    }
    const entradasGuardadas = JSON.parse(textoGuardado);
    return Array.isArray(entradasGuardadas) ? entradasGuardadas : [];
  } catch (error) {
    console.error('Error al leer las entradas guardadas:', error);
    return null;
  }
}

// Guarda el array completo de entradas. Devuelve true si salió bien, false si falló
// (por ejemplo, si el navegador bloquea localStorage o se quedó sin espacio).
function guardarEntradas(entradas) {
  try {
    localStorage.setItem(CLAVE_STORAGE_ENTRADAS, JSON.stringify(entradas));
    return true;
  } catch (error) {
    console.error('Error al guardar las entradas:', error);
    return false;
  }
}
