// Runner interactivo de /mission/: compila y ejecuta cada ejercicio en el navegador
// via CheerpJ (JVM en WASM) + Janino (compilador Java 8 syntax, ~1.5MB de JARs
// hosteados en /mission/lib/). Todo sucede en el tab del visitante; el servidor
// sigue siendo estático, sin superficie de ataque.
//
// El primer botón que se aprieta dispara el bootstrap (loader de CheerpJ + init de
// la JVM + carga de Janino + captura de streams). Las siguientes corridas reusan
// el mismo runtime: por ejercicio se hace cook(source + wrapper), loadClass, y
// reflection.invoke — todo en un par de cientos de ms.
//
// Descubrimientos del spike que están cristalizados acá:
//   - CheerpJ 4.3 con Java 17 provee la JRE, no la JDK — no hay javac ni
//     jdk.compiler module. Por eso Janino, que es un compilador Java escrito en
//     Java 100% autónomo.
//   - Library mode NO convierte Uint8Array a byte[] (falla con "Method 'null'
//     cannot be resolved"). Sí convierte Array<number>. Por eso Array.from().
//   - Reflection desde JS requiere resolver Class objects via Class.forName;
//     invoke acepta strings/números JS directos como args primitivos.
//   - Para no pelear con reflection lado JS para main(String[]), cook-eamos un
//     __Wrap.run(String) que hace la reflection en Java.

const URL_LOADER = 'https://cjrtnc.leaningtech.com/4.3/loader.js';
const JARS_JANINO = '/app/mission/lib/janino.jar:/app/mission/lib/commons-compiler.jar';

// Cargado una sola vez por página (astro:page-load re-usa la misma tab, y CheerpJ
// vive en el módulo, no en el DOM). Si el bootstrap falla lo dejamos null para
// que un segundo intento no reuse un promise rechazado.
let promesaRuntime = null;

const WRAPPER_JAVA = `
public class __Wrap {
  public static void run(String cls) throws Throwable {
    Class.forName(cls).getDeclaredMethod("main", String[].class).invoke(null, (Object) new String[0]);
  }
}
`;

async function cargarLoader() {
  if (window.cheerpjInit) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = URL_LOADER;
    s.onload = resolve;
    s.onerror = () => reject(new Error('no se pudo cargar el loader de CheerpJ (bloqueado?)'));
    document.head.appendChild(s);
  });
  if (!window.cheerpjInit) throw new Error('loader.js cargó pero no expuso cheerpjInit');
}

async function iniciarRuntime(onProgress) {
  if (promesaRuntime) return promesaRuntime;
  promesaRuntime = (async () => {
    try {
      onProgress?.('Descargando runtime Java (~40MB, cacheado después)…');
      await cargarLoader();
      onProgress?.('Inicializando la JVM (la primera vez tarda un rato)…');
      await window.cheerpjInit({ version: 17, status: 'none' });
      onProgress?.('Cargando el compilador (Janino)…');
      const lib = await window.cheerpjRunLibrary(JARS_JANINO);
      onProgress?.('Configurando streams…');
      const System = await lib.java.lang.System;
      const PrintStream = await lib.java.io.PrintStream;
      const ByteArrayOutputStream = await lib.java.io.ByteArrayOutputStream;
      const ByteArrayInputStream = await lib.java.io.ByteArrayInputStream;
      const SimpleCompiler = await lib.org.codehaus.janino.SimpleCompiler;
      const Class = await lib.java.lang.Class;
      const stringCls = await Class.forName('java.lang.String');
      const bufOut = await new ByteArrayOutputStream();
      const bufErr = await new ByteArrayOutputStream();
      await System.setOut(await new PrintStream(bufOut, true));
      await System.setErr(await new PrintStream(bufErr, true));
      return { lib, System, ByteArrayInputStream, SimpleCompiler, stringCls, bufOut, bufErr };
    } catch (e) {
      promesaRuntime = null;
      throw e;
    }
  })();
  return promesaRuntime;
}

async function ejecutar({ nombreClase, fuente, stdin, onProgress }) {
  const r = await iniciarRuntime(onProgress);

  onProgress?.('Instalando entrada estándar…');
  const bytes = Array.from(new TextEncoder().encode(stdin || ''));
  const bais = await new r.ByteArrayInputStream(bytes);
  await r.System.setIn(bais);

  await r.bufOut.reset();
  await r.bufErr.reset();

  onProgress?.('Compilando…');
  const compiler = await new r.SimpleCompiler();
  try {
    // Guardarraíl: Janino tiene un compilador entero para arrancar, y algún caso
    // patológico (features Java 14+ que no soporta) podría dejar la promesa
    // colgada. 30s es amplio para código real, imposible para uno que quedó trabado.
    await promesaConTimeout(compiler.cook(fuente + '\n' + WRAPPER_JAVA), 30000);
  } catch (e) {
    return {
      tipo: 'error-compilacion',
      mensaje: await extraerMensajeError(e),
    };
  }

  const cl = await compiler.getClassLoader();
  let wrapCls;
  try {
    wrapCls = await cl.loadClass('__Wrap');
  } catch (e) {
    return { tipo: 'error-carga', mensaje: await extraerMensajeError(e) };
  }
  const runMethod = await wrapCls.getMethod('run', r.stringCls);

  onProgress?.('Ejecutando…');
  let errorRuntime = null;
  try {
    await runMethod.invoke(null, nombreClase);
  } catch (e) {
    errorRuntime = await extraerMensajeError(e);
  }

  const stdout = await r.bufOut.toString();
  const stderr = await r.bufErr.toString();

  if (errorRuntime) {
    return { tipo: 'error-runtime', stdout, stderr, mensaje: errorRuntime };
  }
  return { tipo: 'ok', stdout, stderr };
}

// Los errores que vienen de código Java en library mode son Throwables reales,
// no strings — hay que preguntarles el mensaje con getMessage() (async, como
// todo en library mode). Si eso también falla, caemos al toString del Throwable.
async function extraerMensajeError(e) {
  if (!e) return 'error desconocido';
  if (typeof e === 'string') return e;
  // Java Throwable expuesto vía library mode
  if (typeof e.getMessage === 'function') {
    try {
      const msg = await e.getMessage();
      if (msg) return msg;
    } catch (_) {}
    try {
      const s = await e.toString();
      if (s) return s;
    } catch (_) {}
    return 'Java Throwable (sin mensaje disponible)';
  }
  // JS Error normal (timeout, etc.)
  if (e.message) return e.message;
  try { return String(e); } catch (_) { return 'error no imprimible'; }
}

function promesaConTimeout(promesa, ms) {
  return Promise.race([
    promesa,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`la operación tardó más de ${ms/1000}s (probablemente el compilador se colgó con una feature no soportada)`)), ms)),
  ]);
}

function renderizarResultado(res) {
  if (res.tipo === 'error-compilacion') {
    return { texto: 'ERROR DE COMPILACIÓN\n\n' + res.mensaje, esError: true };
  }
  if (res.tipo === 'error-carga') {
    return { texto: 'ERROR CARGANDO LA CLASE\n\n' + res.mensaje, esError: true };
  }
  const partes = [];
  if (res.stdout) partes.push(res.stdout.trimEnd());
  if (res.stderr) partes.push((res.stdout ? '\n' : '') + '--- stderr ---\n' + res.stderr.trimEnd());
  if (res.tipo === 'error-runtime') {
    partes.push('\n--- excepción ---\n' + res.mensaje);
  }
  const texto = partes.join('\n') || '(sin salida)';
  return { texto, esError: res.tipo === 'error-runtime' };
}

function wireBotones() {
  const scriptDatos = document.getElementById('mission-fuentes');
  if (!scriptDatos) return;
  let fuentes;
  try {
    fuentes = JSON.parse(scriptDatos.textContent);
  } catch (e) {
    return;
  }
  const porId = new Map(fuentes.map((f) => [f.id, f]));

  for (const boton of document.querySelectorAll('.boton-ejecutar')) {
    if (boton.dataset.wired === '1') continue;
    boton.dataset.wired = '1';

    boton.addEventListener('click', () => {
      const id = boton.dataset.runId;
      const info = porId.get(id);
      if (!info) return;
      const article = boton.closest('.ejercicio');
      const panel = article.querySelector('.runtime-panel');
      const stdinBox = panel.querySelector('.runtime-stdin');
      const correrBtn = panel.querySelector('.boton-correr');
      const estado = panel.querySelector('.runtime-estado');
      const outputPre = panel.querySelector('.runtime-output');
      const outputCode = outputPre.querySelector('code');

      panel.hidden = false;
      boton.hidden = true;

      const correr = async () => {
        correrBtn.disabled = true;
        outputPre.classList.remove('runtime-output--error', 'runtime-output--ok');
        outputCode.textContent = '';
        const setEstado = (t) => { estado.textContent = t; };
        try {
          const res = await ejecutar({
            nombreClase: info.nombre,
            fuente: info.fuente,
            stdin: info.interactivo ? (stdinBox?.value ?? '') : '',
            onProgress: setEstado,
          });
          const { texto, esError } = renderizarResultado(res);
          outputCode.textContent = texto;
          outputPre.classList.add(esError ? 'runtime-output--error' : 'runtime-output--ok');
          if (!esError && typeof crearConfetti === 'function') {
            crearConfetti(window.innerWidth / 2, window.innerHeight / 2);
          }
          setEstado(esError ? 'Terminó con error' : 'Listo');
        } catch (e) {
          outputCode.textContent = 'Error del runtime: ' + extraerMensajeError(e);
          outputPre.classList.add('runtime-output--error');
          setEstado('Falló el runtime');
        } finally {
          correrBtn.disabled = false;
        }
      };

      if (correrBtn.dataset.wired !== '1') {
        correrBtn.dataset.wired = '1';
        correrBtn.addEventListener('click', correr);
      }
      correr();
    });
  }
}

document.addEventListener('astro:page-load', wireBotones);
