// RSS de la bitácora, generado en build. Sin dependencias: parsea el archivo
// que ya sirve al cliente (public/blog/datos/entradas-publicadas.js) como fuente
// única de la verdad, y arma el XML a mano — con 4 entradas no vale la pena una lib.
import fs from 'node:fs';
import path from 'node:path';

// Extrae el array literal del archivo JS: no es un módulo (asigna a un const global
// para que <script src> lo levante). Regex sobre el bloque `= [ ... ];` — si algún
// día se cambia la forma del archivo, esto grita fuerte en el próximo build.
function leerEntradas() {
  const ruta = path.join(process.cwd(), 'public/blog/datos/entradas-publicadas.js');
  const texto = fs.readFileSync(ruta, 'utf-8');
  const m = texto.match(/=\s*(\[[\s\S]*?\]);/);
  if (!m) return [];
  return JSON.parse(m[1]);
}

function escapar(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function GET(context) {
  const sitio = context.site?.toString().replace(/\/$/, '') ?? '';
  const entradas = leerEntradas()
    .slice()
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  const items = entradas
    .map((e) => {
      const url = `${sitio}/blog/#entrada/${e.id}`;
      const fecha = new Date(e.fechaCreacion).toUTCString();
      return `    <item>
      <title>${escapar(e.titulo)}</title>
      <link>${escapar(url)}</link>
      <guid isPermaLink="false">${escapar(e.id)}</guid>
      <pubDate>${fecha}</pubDate>
      <description>${escapar(e.contenido)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>bitácora — raku</title>
    <link>${sitio}/</link>
    <description>Notas cortas sobre lo que voy aprendiendo.</description>
    <language>es</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
