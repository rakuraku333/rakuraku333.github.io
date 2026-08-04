// Lightbox de capturas: un solo <dialog> vive en Base.astro, este script cablea los
// botones que abren. Antes vivía duplicado en pilates/index.astro y servicios/index.astro.
//
// Re-ejecuta en cada astro:page-load (view transitions) porque los botones cambian
// según la página, pero el <dialog> del layout permanece.

function iniciarLightbox() {
  const dialogo = document.getElementById('dialogo-captura');
  if (!dialogo) return;
  const imagen = document.getElementById('dialogo-captura-imagen');
  const titulo = document.getElementById('dialogo-captura-titulo');
  const cerrar = document.getElementById('boton-cerrar-captura');

  for (const boton of document.querySelectorAll('.boton-captura')) {
    if (boton.dataset.lightboxWired === '1') continue;
    boton.dataset.lightboxWired = '1';
    boton.addEventListener('click', () => {
      imagen.src = boton.dataset.full;
      imagen.alt = boton.dataset.alt || '';
      const h3 = boton.querySelector('h3');
      titulo.textContent = h3 ? h3.textContent : (boton.dataset.alt || '');
      dialogo.showModal();
    });
  }

  if (cerrar.dataset.lightboxWired !== '1') {
    cerrar.dataset.lightboxWired = '1';
    cerrar.addEventListener('click', () => dialogo.close());
    dialogo.addEventListener('click', (evento) => {
      if (evento.target === dialogo) dialogo.close();
    });
  }
}

document.addEventListener('astro:page-load', iniciarLightbox);
