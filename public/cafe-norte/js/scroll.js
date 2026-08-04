// Animación de cascada al hacer scroll: IntersectionObserver + clase .visible.
// El retraso escalonado entre elementos vive en CSS (nth-child), acá solo se decide *cuándo* aparece cada uno.

const elementosAAnimar = document.querySelectorAll(".reveal");

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

elementosAAnimar.forEach((el) => observador.observe(el));
