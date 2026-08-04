// Guardar y leer las imágenes en localStorage. Este archivo no sabe nada del DOM ni de la lógica.

// Devuelve el array de imágenes guardadas:
// - [] si todavía no hay nada guardado,
// - null si hubo un error al leer (el que llama decide qué mostrarle al usuario).
function leerImagenes() {
  try {
    const textoGuardado = localStorage.getItem(CLAVE_STORAGE_IMAGENES);
    if (textoGuardado === null) {
      return [];
    }
    const imagenesGuardadas = JSON.parse(textoGuardado);
    return Array.isArray(imagenesGuardadas) ? imagenesGuardadas : [];
  } catch (error) {
    console.error('Error al leer las imágenes guardadas:', error);
    return null;
  }
}

// Guarda el array completo de imágenes. Devuelve true si salió bien, false si falló.
// Acá el fallo más probable es quedarse sin espacio: las imágenes en base64 ocupan mucho.
function guardarImagenes(imagenes) {
  try {
    localStorage.setItem(CLAVE_STORAGE_IMAGENES, JSON.stringify(imagenes));
    return true;
  } catch (error) {
    console.error('Error al guardar las imágenes:', error);
    return false;
  }
}
