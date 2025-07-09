self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("event-tickets-v1").then((cache) => {
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith(".ics")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          caches.open("event-tickets-v1").then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    );
  }
});