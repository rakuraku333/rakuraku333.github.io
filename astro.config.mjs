// Configuración de Astro: solo lo justo. El sitio es estático (sin SSR: no hay
// backend, GitHub Pages sirve archivos planos) y `site` es la URL pública —
// Astro la usa para armar las og:url/og:image absolutas en Base.astro.
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://rakuraku333.github.io',
});
