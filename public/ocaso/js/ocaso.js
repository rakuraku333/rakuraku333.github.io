// ocaso — un torii wireframe girando contra un ocaso synthwave.
// Algoritmos porteados de waveforge (~/Dev/waveforge/waveforge/patterns/):
//   terraingrid.py: cielo en degradé, sol radial, piso en perspectiva
//   cube.py:        spin 3D + proyección + bump de escala
//   scope.py:       líneas con glow aditivo en dos pasadas
//   bars.py + constants.py: gradiente de 5 paradas y paleta
// Sin audio en una página estática: beatEnv sintético reemplaza la envolvente.

const canvas = document.getElementById('escena')
const ctx = canvas.getContext('2d')

// --- Helpers (porte literal de la matemática de waveforge) ---
function hexToRgb(hex) {
  const v = hex.slice(1)
  return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255)
}
function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
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
// bars.py gradient_at: interpola entre la parada actual y la siguiente.
function gradientAt(y) {
  const count = GRADIENT.length
  let color = Math.floor((count - 1) * y)
  color = Math.min(count - 2, Math.max(0, color))
  const yMin = color / (count - 1)
  const yMax = (color + 1) / (count - 1)
  return mix(GRADIENT[color], GRADIENT[color + 1], (y - yMin) / (yMax - yMin))
}
function rgb(c) {
  return `rgb(${Math.min(255, c[0] * 255) | 0},${Math.min(255, c[1] * 255) | 0},${Math.min(255, c[2] * 255) | 0})`
}

// --- Paleta (waveforge/constants.py) + escena (terraingrid.py) ---
const BG = hexToRgb('#0e0805')
const GRADIENT = ['#2b1a0f', '#4a2c17', '#7a4a24', '#a9713a', '#d9a75c'].map(hexToRgb)
const TORII_RED = hexToRgb('#BE3A34') // --torii del sitio
const HORIZON = 0.15
const SUN_RADIUS = 0.35
const GLOW_BEAT_BOOST = 0.3
// El shader mezcla hasta alto*0.6: lo más claro que llega el cielo.
const SKY_BOTTOM = mix(GRADIENT[0], GRADIENT[4], 0.6)

// --- Tiempos (terraingrid.py + cube.py) ---
const TRAVEL_BASE_SPEED = 0.4
const TRAVEL_BEAT_KICK = 1.8
const TRAVEL_LERP_RATE = 6.0
const BASE_SPIN_SPEED = 0.5
const BEAT_SPIN_KICK = 3.0
const SPIN_LERP_RATE = 5.0
const BEAT_POP_SCALE = 1.15
const CAMERA_DISTANCE = 3.0
const FOCAL_LENGTH = 1.6

// --- Glow de líneas (scope.py) ---
const GLOW_LINE_WIDTH = 6
const CORE_LINE_WIDTH = 1.5
const GLOW_ATTENUATION = 0.35

// --- Torii: aristas 3D de cajas extruidas, centradas en el origen ---
function boxEdges(cx, cy, cz, w, h, d) {
  const x0 = cx - w / 2, x1 = cx + w / 2
  const y0 = cy - h / 2, y1 = cy + h / 2
  const z0 = cz - d / 2, z1 = cz + d / 2
  const c = [
    { x: x0, y: y0, z: z0 }, { x: x1, y: y0, z: z0 },
    { x: x1, y: y1, z: z0 }, { x: x0, y: y1, z: z0 },
    { x: x0, y: y0, z: z1 }, { x: x1, y: y0, z: z1 },
    { x: x1, y: y1, z: z1 }, { x: x0, y: y1, z: z1 },
  ]
  return [
    [c[0], c[1]], [c[1], c[2]], [c[2], c[3]], [c[3], c[0]], // cara frontal
    [c[4], c[5]], [c[5], c[6]], [c[6], c[7]], [c[7], c[4]], // cara trasera
    [c[0], c[4]], [c[1], c[5]], [c[2], c[6]], [c[3], c[7]], // conectores z
  ]
}
const TORII_EDGES = [
  ...boxEdges(0, 0.70, 0, 1.6, 0.12, 0.12),        // kasagi (viga superior)
  ...boxEdges(-0.6, -0.075, 0, 0.12, 1.25, 0.12),  // pilar izquierdo
  ...boxEdges(0.6, -0.075, 0, 0.12, 1.25, 0.12),   // pilar derecho
  ...boxEdges(0, 0.25, 0, 1.2, 0.08, 0.12),        // nuki (travesaño)
]

// --- Spin + proyección (porte de cube.py; eje Y, no tumble) ---
function rotateX(v, a) {
  const c = Math.cos(a), s = Math.sin(a)
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c }
}
function rotateY(v, a) {
  const c = Math.cos(a), s = Math.sin(a)
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c }
}

// --- Resize: canvas a tamaño CSS × DPR (tope 2) ---
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

// --- Dibujo ---
function glowLine(x1, y1, x2, y2, color, haloW, coreW, coreOp = 'lighter') {
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = rgb(scaleColor(color, GLOW_ATTENUATION))
  ctx.lineWidth = haloW
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.globalCompositeOperation = coreOp
  ctx.strokeStyle = rgb(color)
  ctx.lineWidth = coreW
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function projectTorii(v, angleX, angleY, scale) {
  const r = rotateY(rotateX(v, angleX), angleY)
  const x = r.x * scale, y = r.y * scale, z = r.z * scale
  const px = (x * FOCAL_LENGTH) / (CAMERA_DISTANCE - z)
  const py = (y * FOCAL_LENGTH) / (CAMERA_DISTANCE - z)
  // -py: y del modelo apunta arriba, y de canvas apunta abajo
  return { sx: cssW / 2 + px * cssH * 0.32, sy: cssH * 0.5 - py * cssH * 0.32 }
}

function drawScene(beatEnv, spinAngle) {
  const aspect = cssW / cssH
  const horizonY = cssH * (0.5 + HORIZON)
  const glowBoost = 1 + GLOW_BEAT_BOOST * beatEnv

  // 1. Cielo: degradé oscuro arriba -> ámbar en el horizonte (terraingrid)
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY)
  sky.addColorStop(0, rgb(GRADIENT[0]))
  sky.addColorStop(1, rgb(SKY_BOTTOM))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, cssW, horizonY)

  // 2. Sol: glow radial aditivo sobre el horizonte, recortado al cielo
  const sunR = SUN_RADIUS * cssH * (1 + (BEAT_POP_SCALE - 1) * beatEnv)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, cssW, horizonY)
  ctx.clip()
  ctx.globalCompositeOperation = 'lighter'
  const sun = ctx.createRadialGradient(cssW / 2, horizonY, 0, cssW / 2, horizonY, sunR)
  sun.addColorStop(0, rgb(GRADIENT[4]))
  sun.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(cssW / 2, horizonY, sunR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.globalCompositeOperation = 'source-over'

  // 3. Piso: banda oscura + grilla en perspectiva (porte vectorial de terraingrid)
  ctx.fillStyle = rgb(BG)
  ctx.fillRect(0, horizonY, cssW, cssH - horizonY)
  const travelFrac = travel - Math.floor(travel)
  ctx.lineCap = 'round'
  // Longitudinales: convergen al punto de fuga en el centro del horizonte
  const colSpacing = cssW / 14
  const longColor = scaleColor(gradientAt(0.55), glowBoost)
  for (let i = -7; i <= 7; i++) {
    glowLine(cssW / 2, horizonY, cssW / 2 + (i + travelFrac) * colSpacing, cssH, longColor, 3, 1)
  }
  // Transversales: filas de profundidad que avanzan hacia la cámara
  for (let k = 0; k <= 20; k++) {
    const depth = k - travelFrac
    if (depth <= 0.01) continue
    const rowY = horizonY + (cssH - horizonY) * (1 / (1 + depth * 0.12))
    // cerca = smoothstep(HORIZON, 0.5, -p.y) del shader; -p.y = rowY/cssH - 0.5
    const glow = smoothstep(HORIZON, 0.5, rowY / cssH - 0.5)
    const fog = 1 - Math.min(1, depth * 0.12) // lejanía: lejos se funde con BG
    const color = scaleColor(gradientAt(glow), glowBoost * fog)
    const halfW = Math.min(aspect * cssH * (0.5 + 1 / (depth * 0.5)), cssW)
    glowLine(cssW / 2 - halfW, rowY, cssW / 2 + halfW, rowY, color, 3, 1)
  }

  // 4. Torii: wireframe 3D con glow (cube.py + scope.py), delante del sol.
  // Spin alrededor del eje vertical (tilt X fijo y chico para lectura 3D):
  // el tumble angleX=spinAngle*0.7 de cube.py voltea la puerta y no lee como torii.
  // Núcleo 'source-over': aditivo sobre el sol brillante lavaría el rojo torii.
  const scale = 1 + (BEAT_POP_SCALE - 1) * beatEnv
  const angleX = 0.15
  const angleY = spinAngle
  for (const [a, b] of TORII_EDGES) {
    const va = projectTorii(a, angleX, angleY, scale)
    const vb = projectTorii(b, angleX, angleY, scale)
    glowLine(va.sx, va.sy, vb.sx, vb.sy, TORII_RED, GLOW_LINE_WIDTH, CORE_LINE_WIDTH, 'source-over')
  }
  ctx.globalCompositeOperation = 'source-over'
}

// --- Loop principal: dt clampeado + beat sintético + lerps de waveforge ---
let lastNow = 0
let travel = 0
let travelSpeed = TRAVEL_BASE_SPEED
let spinAngle = 0
let spinSpeed = BASE_SPIN_SPEED

function frame(now) {
  const dt = lastNow === 0 ? 0 : Math.min(0.05, (now - lastNow) / 1000)
  lastNow = now
  const beatEnv = Math.max(0, Math.sin(now * 0.0025)) ** 3

  const targetSpeed = TRAVEL_BASE_SPEED + beatEnv * TRAVEL_BEAT_KICK
  travelSpeed += (targetSpeed - travelSpeed) * Math.min(1, dt * TRAVEL_LERP_RATE)
  travel += travelSpeed * dt

  const targetSpin = BASE_SPIN_SPEED + beatEnv * BEAT_SPIN_KICK
  spinSpeed += (targetSpin - spinSpeed) * Math.min(1, dt * SPIN_LERP_RATE)
  spinAngle += spinSpeed * dt

  if (cssW > 0 && cssH > 0) drawScene(beatEnv, spinAngle)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
