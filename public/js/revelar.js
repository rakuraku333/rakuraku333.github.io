// Entrada de secciones al hacer scroll: agrega ".visible" a los ".revelar" cuando
// entran en viewport, así el CSS puede animarlos (ver .revelar en efectos.css). Con
// "reduced motion" no tiene sentido animar nada: se muestran todos de una.
//
// Se ejecuta en cada navegación (view transitions incluidas): astro:page-load dispara
// tanto en la primera carga como en cada transición SPA, y hay que re-registrar el
// observer sobre los .revelar del DOM nuevo porque el anterior queda huérfano.

function iniciarRevelar() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.revelar').forEach((el) => el.classList.add('visible'));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        // Escalonado: cada elemento se retrasa según su posición entre hermanos,
        // así una fila de tarjetas entra en cascada en vez de todas juntas.
        const indice = [...entrada.target.parentElement.children].indexOf(entrada.target);
        entrada.target.style.transitionDelay = `${Math.min(indice, 6) * 60}ms`;
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );
  document.querySelectorAll('.revelar').forEach((el) => observador.observe(el));
}

document.addEventListener('astro:page-load', iniciarRevelar);
