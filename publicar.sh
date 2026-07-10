#!/bin/bash
# Publica la bitácora en el sitio con un solo comando.
#
# Uso:
#   ./publicar.sh                       -> commit con mensaje genérico
#   ./publicar.sh "bitacora: mi nota"   -> commit con mensaje propio
#
# Qué hace (e imprime cada paso, para ir aprendiendo el flujo de git):
#   1. Si hay un export recién descargado del blog (entradas-publicadas*.js en
#      ~/Descargas o ~/Downloads, más nuevo que el del repo), lo mueve adentro.
#   2. Si no hay export, publica los cambios hechos a mano en blog/datos/.
#   3. git add + commit + push. GitHub Pages actualiza el sitio solo (~1 min).

set -e
cd "$(dirname "$0")"

ARCHIVO_REPO="blog/datos/entradas-publicadas.js"
MENSAJE="${1:-bitacora: nueva entrada}"

# 1. Buscar un export descargado más nuevo que lo que ya tiene el repo.
DESCARGA=""
for carpeta in "$HOME/Descargas" "$HOME/Downloads"; do
  candidato=$(ls -t "$carpeta"/entradas-publicadas*.js 2>/dev/null | head -1 || true)
  if [ -n "$candidato" ] && [ "$candidato" -nt "$ARCHIVO_REPO" ]; then
    DESCARGA="$candidato"
    break
  fi
done

if [ -n "$DESCARGA" ]; then
  if ! grep -q "ENTRADAS_PUBLICADAS" "$DESCARGA"; then
    echo "ERROR: $DESCARGA no parece un export del blog (falta ENTRADAS_PUBLICADAS)." >&2
    exit 1
  fi
  echo "-> export descargado encontrado: $DESCARGA"
  echo "-> mv \"$DESCARGA\" $ARCHIVO_REPO"
  mv "$DESCARGA" "$ARCHIVO_REPO"
else
  echo "-> sin export nuevo en Descargas: publico los cambios locales de $ARCHIVO_REPO"
fi

# 2. ¿Hay algo distinto de lo ya publicado?
if git diff --quiet -- "$ARCHIVO_REPO" && git diff --cached --quiet -- "$ARCHIVO_REPO"; then
  echo "Nada para publicar: $ARCHIVO_REPO está igual que lo que ya está en el sitio."
  exit 0
fi

# 3. Publicar.
echo "-> git add $ARCHIVO_REPO"
git add "$ARCHIVO_REPO"
echo "-> git commit -m \"$MENSAJE\""
git commit -m "$MENSAJE"
echo "-> git push"
git push
echo
echo "Publicado. En ~1 minuto se ve en https://rakuraku333.github.io"
echo "(si no aparece, recargá con Ctrl+Shift+R: el CDN cachea unos minutos)"
