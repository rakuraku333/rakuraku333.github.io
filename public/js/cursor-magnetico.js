// Cursor magnético: punto torii que sigue el mouse y se engancha a botones/tarjetas.
// Se reinitializa en cada astro:page-load para SPA navigation.

function iniciarCursorMagnetico() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // No motion effects requested
  }

  const cursor = document.querySelector('.cursor-magnetico');
  if (!cursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let magneticX = 0;
  let magneticY = 0;
  let isAttracted = false;
  let targetEl = null;

  // Track real mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursor();
  });

  // Magnetic attraction on interactive elements
  const selectores = '.boton-principal, .boton-secundario, .tarjeta, .tarjeta-destacada, .enlaces-nav a';
  document.addEventListener('mouseenter', (e) => {
    const el = e.target.closest(selectores);
    if (el) {
      targetEl = el;
      isAttracted = true;
    }
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const el = e.target.closest(selectores);
    if (el === targetEl) {
      targetEl = null;
      isAttracted = false;
      magneticX = mouseX;
      magneticY = mouseY;
    }
  }, true);

  function updateCursor() {
    if (isAttracted && targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const dist = Math.hypot(targetX - mouseX, targetY - mouseY);
      if (dist < 60) {
        // Lerp toward target over 150ms (0.1 factor per frame at 60fps ≈ 150ms)
        magneticX += (targetX - magneticX) * 0.1;
        magneticY += (targetY - magneticY) * 0.1;
      } else {
        isAttracted = false;
        magneticX = mouseX;
        magneticY = mouseY;
      }
    } else {
      magneticX = mouseX;
      magneticY = mouseY;
    }

    cursor.style.setProperty('--cursor-x', magneticX);
    cursor.style.setProperty('--cursor-y', magneticY);
    requestAnimationFrame(updateCursor);
  }

  updateCursor();
}

document.addEventListener('astro:page-load', iniciarCursorMagnetico);
iniciarCursorMagnetico(); // Also run on initial load
