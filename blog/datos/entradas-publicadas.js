// Entradas publicadas de la bitácora: este archivo ES el contenido público del sitio.
// La landing y el blog lo leen tal cual; los visitantes ven exactamente lo que hay acá.
//
// Cómo publicar: escribí un borrador en el blog, tocá "Exportar para publicar" y
// reemplazá este archivo con el que se descarga. Después: commit y listo.
// Cada entrada tiene la misma forma que las del editor: {id, titulo, contenido, fechaCreacion}.

const ENTRADAS_PUBLICADAS = [
  {
    id: "2026-07-09-la-portada-es-una-bitacora",
    titulo: "La portada ahora es una bitácora",
    contenido: "Reorganicé el sitio: la portada dejó de ser una vidriera de apps y pasó a ser esto, una bitácora.\n\nLas notas que escriba van a aparecer acá, en cascada, con la más nueva arriba. Las herramientas que construyo ahora viven en su propia página, **proyectos**, y quién soy está en **sobre mí**.\n\nEl flujo para publicar es deliberadamente simple: escribo en el editor del blog, exporto y commiteo. Sin backend, sin base de datos: el contenido es un archivo más del repositorio.",
    fechaCreacion: "2026-07-09T12:00:00.000",
  },
];
