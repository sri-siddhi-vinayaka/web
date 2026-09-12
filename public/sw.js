// Minimal, single-purpose: show a notification on push, focus/open the app
// on click. No caching, no request interception — this service worker only
// exists for push notifications, not to make this an offline-capable app.

self.addEventListener("push", (event) => {
  let data = { title: "Sri Siddhi Vinayaka", body: "Something new was posted.", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to the defaults above rather than fail.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = clientsList.find((client) => client.url.includes(targetUrl));
      if (existing) {
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl);
    })()
  );
});
