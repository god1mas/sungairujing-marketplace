/// <reference lib="webworker" />

import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision?: string | null }>;
};

const isSafePrecacheEntry = (entry: string | { url: string }) => {
  const url = typeof entry === "string" ? entry : entry.url;
  return url.startsWith("/_next/static/") || url.startsWith("/icons/");
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST.filter(isSafePrecacheEntry),
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        request.method === "GET" &&
        url.origin === self.location.origin &&
        (url.pathname.startsWith("/_next/static/") ||
          url.pathname.startsWith("/icons/")),
      handler: new CacheFirst({
        cacheName: "sungairujing-static-v1",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 80,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
