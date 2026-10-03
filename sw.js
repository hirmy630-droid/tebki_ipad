const CACHE_NAME = 'kyowa-roof-weather-pwa-v1';

// インストール時にすぐに有効化
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除してクライアントの制御を開始
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワークファースト（常に最新の状態を反映させるため）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワーク通信が成功した場合はキャッシュを更新
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});