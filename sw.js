const CACHE_NAME = 'shift-calendar-v3';
const urlsToCache = [
  './',
  './index.html',
  './google-calendar.png',
  './manifest.json'
];

// 安装阶段：缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // 立即激活新 SW
  );
});

// 激活阶段：清除旧版本缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // 立即接管所有客户端
  );
});

// 网络优先策略（Network First）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果网络请求成功，更新缓存
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => {
        // 网络请求失败，回退到缓存
        return caches.match(event.request);
      })
  );
});
