// Confetti burst: explosión de partículas en clicks de .boton-principal.
// Canvas-based, sin dependencias. Se limpia después de ~1.5s.

function crearConfetti(x, y) {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9998';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particulas = Array.from({ length: 50 }, () => ({
    x,
    y,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * -6 - 2,
    life: 1,
  }));

  const colores = ['#BE3A34', '#F7F1E4']; // torii, cream

  const anim = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let vivo = false;
    for (const p of particulas) {
      p.x += p.vx;
      p.y += p.vy + 0.2; // gravity
      p.vy *= 0.98;
      p.life -= 0.02;
      if (p.life > 0) {
        vivo = true;
        ctx.fillStyle = colores[Math.random() > 0.5 ? 0 : 1];
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
      }
    }
    if (vivo) requestAnimationFrame(anim);
    else document.body.removeChild(canvas);
  };
  anim();
}

// Trigger on .boton-principal clicks
function iniciarConfetti() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.boton-principal')) {
      const rect = e.target.closest('.boton-principal').getBoundingClientRect();
      crearConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }, true);
}

document.addEventListener('astro:page-load', iniciarConfetti);
iniciarConfetti();
