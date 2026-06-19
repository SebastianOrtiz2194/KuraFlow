/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, url }) => request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/),
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/content/lessons'),
      handler: new NetworkFirst({
        cacheName: 'lesson-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          }),
        ],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      
      // Basic client-side localization
      const lang = self.navigator?.language || "en";
      const isJapanese = lang.startsWith("ja");
      
      let title = payload.title || "KuraFlow";
      const body = payload.body || "You have a new notification!";
      
      if (isJapanese && payload.type === "badge") {
        title = "新しいバッジを獲得しました！ 🏆";
      } else if (isJapanese && payload.type === "streak") {
        title = "ストリーク継続！ 🔥";
      }

      event.waitUntil(
        self.registration.showNotification(title, {
          body: body,
          icon: payload.icon || "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          data: { url: payload.url || "/profile" }
        })
      );
    } catch (e) {
      console.error("Error parsing push payload", e);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
