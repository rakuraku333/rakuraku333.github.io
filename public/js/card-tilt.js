// Tilt 3D en tarjetas: perspectiva que sigue el mouse.
// Deshabilitado en prefers-reduced-motion y en dispositivos touch.

function iniciarTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // No motion effects requested
  }

  document.querySelectorAll('.tarjeta, .tarjeta-destacada').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Calcular ángulo desde el centro de la tarjeta al cursor
      const angle = Math.atan2(y - cy, x - cx);
      const tiltX = Math.sin(angle) * 5; // max 5° tilt
      const tiltY = Math.cos(angle) * -5;

      card.style.setProperty('--tilt-x', `${tiltY}deg`);
      card.style.setProperty('--tilt-y', `${tiltX}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

document.addEventListener('astro:page-load', iniciarTilt);
iniciarTilt();
