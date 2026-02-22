const CACHE_NAME = 'plaka-okuyucu-v1'; // Sistemi güncelledik
const OFFLINE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './model/tesseract.min.js',
    './model/worker.min.js',
    './model/tesseract-core.wasm.js',
    './model/eng.traineddata.gz',
    './model/tf.min.js',
    // Kendi eğittiğin YOLOv8 beyin dosyaları (İnternetsiz çalışması için şart):
    './model/model.json',
    './model/group1-shard1of3.bin',
    './model/group1-shard2of3.bin',
    './model/group1-shard3of3.bin',
    './model/jspdf.umd.min.js' // YENİ: PDF motorunu çevrimdışı listeye ekledik
    
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((networkResponse) => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                return networkResponse;
            });
        }).catch(() => {
            console.warn("Çevrimdışı istek başarısız:", event.request.url);
        })
    );
});