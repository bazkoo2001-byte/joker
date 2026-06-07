// ── Joker PWA Service Worker ──
// غيّر رقم النسخة عند أي تعديل لتحديث الكاش
const CACHE = 'joker-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

// تثبيت: خزّن ملفات التطبيق
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// تفعيل: امسح الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// جلب: الكاش أولاً، ثم الشبكة (مع تخزين خطوط جوجل)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // خزّن خطوط جوجل ديناميكياً عشان تشتغل أوفلاين بعد أول فتحة
        const url = e.request.url;
        if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
