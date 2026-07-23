// Service worker mínimo: solo existe para que Chrome/Android considere la app
// "instalable" (criterio: tener un service worker activo con manejador de fetch).
// ponytail: sin caché real, es pass-through a la red — si en algún momento hace
// falta usar la app sin señal, acá se agrega una estrategia cache-first del
// shell (index.html + css/js + iconos).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(fetch(event.request)));
