// Miniaturas animadas de la sección "Ejemplos": mismo idioma visual que
// ocaso.js (paleta, glow aditivo, beat sintético) pero genérico — un driver
// compartido (resize + loop + beatEnv) y tres dibujos livianos encima, en vez
// de tres copias del boilerplate. Sin audio real: beatEnv es sintético.
// IIFE: ocaso.js y este script comparten el mismo scope global de script
// clásico (sin <script type="module">); sin esto, sus const/function de
// mismo nombre (hexToRgb, GRADIENT, rgb...) colisionan y rompen la carga.
(function () {

function hexToRgb(hex) {
  const v = hex.slice(1)
  return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255)
}
function scaleColor(c, k) {
  return [c[0] * k, c[1] * k, c[2] * k]
}
function clamp01(x) {
  return Math.min(1, Math.max(0, x))
}
function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
function rgb(c) {
  return `rgb(${Math.min(255, c[0] * 255) | 0},${Math.min(255, c[1] * 255) | 0},${Math.min(255, c[2] * 255) | 0})`
}
// hash determinístico: mismos "puntos" (estrellas) en cada frame sin guardar estado.
function hash(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// --- Paleta (waveforge/constants.py), igual que ocaso.js ---
const BG = hexToRgb('#0e0805')
const GRADIENT = ['#2b1a0f', '#4a2c17', '#7a4a24', '#a9713a', '#d9a75c'].map(hexToRgb)
const CYAN_PILARES = hexToRgb('#6fd8e0')

function glowLine(ctx, x1, y1, x2, y2, color, haloW, coreW) {
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = rgb(scaleColor(color, 0.35))
  ctx.lineWidth = haloW
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.strokeStyle = rgb(color)
  ctx.lineWidth = coreW
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.globalCompositeOperation = 'source-over'
}

function fondoOscuro(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, rgb(GRADIENT[0]))
  g.addColorStop(1, rgb(BG))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

// --- Driver genérico: resize a CSS×DPR + loop con beat sintético ---
// (mismo patrón que ocaso.js, factorizado para no repetirlo 3 veces).
function iniciarEscena(id, dibujar, faseBeatMs) {
  const canvas = document.getElementById(id)
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let cssW = 0, cssH = 0

  function resize() {
    cssW = canvas.clientWidth
    cssH = canvas.clientHeight
    if (cssW <= 0 || cssH <= 0) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  window.addEventListener('resize', resize)
  resize()

  function frame(now) {
    // desfasadas entre sí (faseBeatMs) para que las tres no pulsen al unísono.
    const beatEnv = Math.max(0, Math.sin((now + faseBeatMs) * 0.0025)) ** 3
    if (cssW > 0 && cssH > 0) dibujar(ctx, cssW, cssH, now / 1000, beatEnv)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// --- Pilares: gates wireframe que se acercan a cámara y hacen loop ---
function dibujarPilares(ctx, w, h, t, beatEnv) {
  fondoOscuro(ctx, w, h)
  const n = 5
  const velocidad = 0.12 + beatEnv * 0.18
  for (let i = 0; i < n; i++) {
    const cerca = (t * velocidad + i / n) % 1 // 0=lejos, 1=roza la cámara
    const escala = 0.06 + cerca * cerca * 1.35
    const alpha = smoothstep(0, 0.08, cerca) * smoothstep(1, 0.85, cerca)
    if (alpha <= 0.02) continue
    const cx = w * 0.5
    const baseY = h * 0.8
    const pw = w * 0.13 * escala, ph = h * 0.55 * escala
    const x0 = cx - pw / 2, x1 = cx + pw / 2, yTop = baseY - ph, yBot = baseY
    const color = scaleColor(CYAN_PILARES, alpha * (1 + 0.4 * beatEnv))
    const halo = 5 * escala + 1, core = 1.4 * escala + 0.4
    glowLine(ctx, x0, yTop, x1, yTop, color, halo, core) // viga superior
    glowLine(ctx, x0, yTop, x0, yBot, color, halo, core) // poste izquierdo
    glowLine(ctx, x1, yTop, x1, yBot, color, halo, core) // poste derecho
  }
}

// --- Estrellas: campo titilante (hash determinístico) + una fugaz periódica ---
function dibujarEstrellas(ctx, w, h, t, beatEnv) {
  fondoOscuro(ctx, w, h)
  ctx.globalCompositeOperation = 'lighter'
  const n = 40
  for (let i = 0; i < n; i++) {
    const x = hash(i) * w
    const y = hash(i + 100) * h * 0.85
    const freq = 0.5 + hash(i + 200) * 2
    const fase = hash(i + 300) * Math.PI * 2
    const brillo = (0.25 + 0.75 * Math.abs(Math.sin(t * freq + fase))) * (0.6 + 0.4 * beatEnv)
    const r = 0.6 + hash(i + 400) * 1.2
    ctx.fillStyle = `rgba(255,240,220,${brillo.toFixed(3)})`
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }

  // fugaz: fase periódica con cola en degradé, más frecuente/brillante al beat.
  const periodo = 3.4
  const fase = (t % periodo) / periodo
  if (fase < 0.5) {
    const p = fase / 0.5
    const x0 = w * 0.15, y0 = h * 0.12, x1 = w * 0.78, y1 = h * 0.55
    const hx = x0 + (x1 - x0) * p, hy = y0 + (y1 - y0) * p
    const tp = Math.max(0, p - 0.18)
    const tx = x0 + (x1 - x0) * tp, ty = y0 + (y1 - y0) * tp
    const alpha = smoothstep(0, 0.08, p) * smoothstep(1, 0.7, p) * (0.6 + 0.4 * beatEnv)
    const grad = ctx.createLinearGradient(tx, ty, hx, hy)
    grad.addColorStop(0, 'rgba(255,240,220,0)')
    grad.addColorStop(1, `rgba(255,250,235,${alpha.toFixed(3)})`)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'
}

// --- Barras: espectro sintético (suma de senos) + peak-hold aproximado ---
// El "peak" no guarda estado propio: se aproxima con la misma señal evaluada
// un poco en el pasado (siempre <= el nivel actual salvo cuando el nivel cae,
// que es justo cuando un peak-hold real se queda flotando arriba).
function nivelBarra(t, i) {
  const cruda = 0.5 + 0.3 * Math.sin(t * 1.3 + i * 0.7)
    + 0.2 * Math.sin(t * 2.1 + i * 1.3) + 0.15 * Math.sin(t * 0.6 - i * 0.4)
  return clamp01(cruda * 0.5 + 0.5)
}
function dibujarBarras(ctx, w, h, t, beatEnv) {
  fondoOscuro(ctx, w, h)
  const n = 24, gap = 0.25, bw = w / n
  for (let i = 0; i < n; i++) {
    const nivel = nivelBarra(t, i) * (0.55 + 0.45 * beatEnv)
    const bh = nivel * h * 0.85
    const x = i * bw + bw * gap / 2, bwv = bw * (1 - gap)
    const y = h - bh
    const grad = ctx.createLinearGradient(0, y, 0, h)
    grad.addColorStop(0, rgb(GRADIENT[4]))
    grad.addColorStop(1, rgb(GRADIENT[1]))
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(x, y, bwv, Math.max(bh, 2), [bwv / 2, bwv / 2, 0, 0])
    ctx.fill()

    const nivelPico = nivelBarra(t - 0.4, i) * (0.55 + 0.45 * beatEnv)
    const peakY = h - Math.max(nivel, nivelPico * 0.94) * h * 0.85 - 3
    ctx.fillStyle = rgb(scaleColor(GRADIENT[4], 1.3))
    ctx.fillRect(x, peakY, bwv, 2)
  }
}

iniciarEscena('escena-pilares', dibujarPilares, 0)
iniciarEscena('escena-estrellas', dibujarEstrellas, 900)
iniciarEscena('escena-bars', dibujarBarras, 1800)
})()
