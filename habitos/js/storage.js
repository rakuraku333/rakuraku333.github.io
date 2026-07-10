// Guardar y leer los hábitos en localStorage. Este archivo no sabe nada del DOM ni de la lógica.

// Devuelve el array de hábitos guardados:
// - [] si todavía no hay nada guardado,
// - null si hubo un error al leer (el que llama decide qué mostrarle al usuario).
function leerHabitos() {
  try {
    const textoGuardado = localStorage.getItem(CLAVE_STORAGE_HABITOS);
    if (textoGuardado === null) {
      return [];
    }
    const habitosGuardados = JSON.parse(textoGuardado);
    return Array.isArray(habitosGuardados) ? habitosGuardados : [];
  } catch (error) {
    console.error('Error al leer los hábitos guardados:', error);
    return null;
  }
}

// Guarda el array completo de hábitos. Devuelve true si salió bien, false si falló
// (por ejemplo, si el navegador bloquea localStorage o se quedó sin espacio).
function guardarHabitos(habitos) {
  try {
    localStorage.setItem(CLAVE_STORAGE_HABITOS, JSON.stringify(habitos));
    return true;
  } catch (error) {
    console.error('Error al guardar los hábitos:', error);
    return false;
  }
}
