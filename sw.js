const CACHE = 'nonbiri-shanghai-v8';
const FILES = ['./', 'index.html', 'style.css', 'game.js', 'music.js', 'manifest.webmanifest',
  'img/st/anzendaiichi.webp', 'img/st/arigato.webp', 'img/st/chui.webp', 'img/st/hokoku.webp', 'img/st/kakunin.webp', 'img/st/kanryo.webp', 'img/st/kyukei.webp', 'img/st/modorimashita.webp', 'img/st/ohayo.webp', 'img/st/osakini.webp', 'img/st/otsukare.webp', 'img/st/ryokai.webp', 'img/st/shinkochu.webp', 'img/st/shochi.webp', 'img/st/shuppatsu.webp', 'img/st/taio.webp', 'img/st/tochaku.webp', 'img/st/yoroshiku.webp', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// network-first (so a new version shows up on the next launch), cache fallback for offline play
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
