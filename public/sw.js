/**
 * Imposter — offline service worker.
 *
 * The game has no API and no server logic, so once the shell and its assets are
 * in the cache the whole thing runs with the network switched off. That matters:
 * parties happen in basements, on trains, and in pubs with hostile wifi.
 *
 * Strategy:
 *   - navigations: network first, falling back to the cached shell offline, so a
 *     deploy is picked up as soon as there is a connection
 *   - hashed build assets (/_next/static/**): cache first — the URL changes when
 *     the content does, so a hit is always correct
 *   - other same-origin GETs (icons, manifest): stale-while-revalidate
 *
 * Nothing about a round is ever cached, because nothing about a round is ever
 * fetched — the word, the roles and the votes never leave memory.
 */

const VERSION = "imposter-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

// Scope is the directory this worker is served from: "/" on Vercel,
// "/Impostor/" on GitHub Pages. Everything is resolved against it.
const SHELL_URL = new URL("./", self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // `reload` bypasses the HTTP cache so a stale shell is never installed.
      await cache.add(new Request(SHELL_URL, { cache: "reload" }));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => !name.startsWith(VERSION)).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return hit ?? (await network) ?? Response.error();
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(SHELL_URL, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const shell = await cache.match(SHELL_URL);
    if (shell) return shell;
    return new Response("Offline, and the game has not been cached yet.", {
      status: 503,
      headers: { "content-type": "text/plain" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Build output is content-hashed, so a cached copy can never be wrong.
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});
