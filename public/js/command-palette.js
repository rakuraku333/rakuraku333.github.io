// Command palette: Ctrl+K para búsqueda rápida de rutas, apps y entradas de bitácora.
// Debounced filtering, keyboard navigation, view transitions compatible.

function iniciarCommandPalette() {
  const dialog = document.getElementById('command-palette');
  const input = document.getElementById('command-palette-input');
  const resultsList = document.getElementById('command-palette-results');
  if (!dialog || !input || !resultsList) return;

  // Index de búsqueda: rutas + apps + blog entries
  const RUTAS = [
    { path: '/', label: 'Inicio', desc: 'Home' },
    { path: '/proyectos/', label: 'Proyectos', desc: 'Apps y herramientas' },
    { path: '/blog/', label: 'Bitácora', desc: 'Notas y reflexiones' },
    { path: '/blog/taller/', label: 'Taller', desc: 'Editor de bitácora' },
    { path: '/mission/', label: 'Mission', desc: 'Ejercicios de Java' },
    { path: '/galeria/', label: 'Galería', desc: 'Imágenes y trabajos' },
    { path: '/habitos/', label: 'Hábitos', desc: 'App de rachas' },
    { path: '/gastos/', label: 'Rakucash', desc: 'Billetera personal' },
    { path: '/ocaso/', label: 'Ocaso', desc: 'Canvas interactivo' },
    { path: '/pilates/', label: 'Pilates Base', desc: 'Gestión de estudio' },
    { path: '/waveforge/', label: 'Waveforge', desc: 'Motor de visuales' },
    { path: '/servicios/', label: 'Servicios', desc: 'Qué ofrezco' },
    { path: '/sobre-mi/', label: 'Sobre mí', desc: 'Quién soy' },
  ];

  const APPS = [
    { path: '/gastos/', label: 'rakucash', desc: 'Billetera instalable' },
    { path: '/waveforge/', label: 'waveforge', desc: 'Visuales audio-reactivos' },
    { path: '/habitos/', label: 'hábitos', desc: 'Seguimiento de rachas' },
    { path: '/pilates/', label: 'Pilates Base', desc: 'Gestión de estudio' },
  ];

  let index = [...RUTAS, ...APPS];
  let selectedIdx = 0;

  // Intentar cargar entradas de bitácora si están disponibles
  if (typeof ENTRADAS_PUBLICADAS !== 'undefined') {
    for (const entrada of ENTRADAS_PUBLICADAS) {
      index.push({
        path: `/blog/#entrada/${entrada.id}`,
        label: entrada.titulo,
        desc: 'Entrada de bitácora',
      });
    }
  }

  let filterTimeout;
  let currentResults = [];

  // Abrir/cerrar con Ctrl+K o Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      dialog.showModal?.();
      input.focus();
    }
  });

  // Cerrar con Escape
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dialog.close?.();
    }
  });

  // Filtrado con debounce 100ms
  input.addEventListener('input', () => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(filtrarYMostrar, 100);
  });

  // Navegación con flechas
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % Math.max(currentResults.length, 1);
      actualizarSeleccion();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + Math.max(currentResults.length, 1)) % Math.max(currentResults.length, 1);
      actualizarSeleccion();
    } else if (e.key === 'Enter' && currentResults.length > 0) {
      e.preventDefault();
      const result = currentResults[selectedIdx];
      dialog.close?.();
      window.location.href = result.path;
    }
  });

  function filtrarYMostrar() {
    const query = input.value.toLowerCase();
    if (!query) {
      currentResults = index;
    } else {
      currentResults = index.filter((item) => {
        return item.label.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
      });
    }
    selectedIdx = 0;
    mostrarResultados();
  }

  function mostrarResultados() {
    resultsList.innerHTML = '';
    if (currentResults.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay resultados';
      li.style.padding = '12px 20px';
      li.style.color = 'var(--ink-soft)';
      resultsList.appendChild(li);
      return;
    }

    currentResults.forEach((item, idx) => {
      const li = document.createElement('li');
      li.setAttribute('aria-selected', idx === selectedIdx);
      li.innerHTML = `
        <div>${item.label}</div>
        <div>${item.desc}</div>
      `;
      li.addEventListener('click', () => {
        dialog.close?.();
        window.location.href = item.path;
      });
      resultsList.appendChild(li);
    });
  }

  function actualizarSeleccion() {
    document.querySelectorAll('.command-palette-results li').forEach((li, idx) => {
      li.setAttribute('aria-selected', idx === selectedIdx);
    });
    // Scroll into view
    const selectedLi = document.querySelector('.command-palette-results li[aria-selected="true"]');
    selectedLi?.scrollIntoView({ block: 'nearest' });
  }

  // Inicializar con todas las rutas
  filtrarYMostrar();
}

document.addEventListener('astro:page-load', iniciarCommandPalette);
iniciarCommandPalette();
