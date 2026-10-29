const V = 'habilitaciones-v6';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const CDN = ['https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(CORE);
    for (const u of CDN) { try { await c.put(u, await fetch(new Request(u, { mode: 'no-cors' }))); } catch (err) { /* se reintenta al usarse */ } }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== V) await caches.delete(k); await self.clients.claim(); })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const host = new URL(r.url).hostname;
  if (/supabase\.(co|in)$/.test(host)) return; // datos en vivo: nunca desde la caché
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});
