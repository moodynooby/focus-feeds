// Service Worker for Focus Feeds PWA
// Provides offline capability and caching for RSS reader

const CACHE_NAME = "focus-feeds-v1";
const STATIC_CACHE_NAME = "focus-feeds-static-v1";
const FEED_CACHE_NAME = "focus-feeds-feeds-v1";

// Assets to cache for offline use
const STATIC_ASSETS = [
	"/",
	"/manifest.json",
	"/icon-192.png",
	"/icon512.png",
	"/icon-maskable-512.png",
	"/fallback-icon.png",
];

self.addEventListener("install", (event) => {
	console.log("Service Worker installing");
	event.waitUntil(
		caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	console.log("Service Worker activating");
	event.waitUntil(
		caches.keys().then((cacheNames) =>
			Promise.all(
				cacheNames.map((cacheName) => {
					if (
						cacheName.startsWith("focus-feeds-") &&
						cacheName !== CACHE_NAME &&
						cacheName !== STATIC_CACHE_NAME &&
						cacheName !== FEED_CACHE_NAME
					) {
						return caches.delete(cacheName);
					}
					return Promise.resolve();
				}),
			),
		),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Handle RSS feed requests (API routes)
	if (url.pathname.startsWith("/api/feeds") || url.pathname.includes("rss")) {
		event.respondWith(
			caches.open(FEED_CACHE_NAME).then((cache) => {
				return fetch(request)
					.then((response) => {
						cache.put(request, response.clone());
						return response;
					})
					.catch(() => {
						return cache.match(request).then((cachedResponse) => {
							if (cachedResponse) {
								return cachedResponse;
							}
							return new Response(
								JSON.stringify({
									success: false,
									error: "Offline - no cached data available",
									items: [],
								}),
								{
									headers: { "Content-Type": "application/json" },
									status: 503,
								},
							);
						});
					});
			}),
		);
		return;
	}

	// Handle static assets
	if (request.method === "GET") {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				if (cachedResponse) {
					fetch(request)
						.then((response) => {
							caches
								.open(STATIC_CACHE_NAME)
								.then((cache) => cache.put(request, response.clone()));
						})
						.catch(() => {});
					return cachedResponse;
				}
				return fetch(request).catch(() => {
					if (request.destination === "document") {
						return caches.match("/");
					}
					return new Response("", {
						status: 503,
						statusText: "Service Unavailable",
					});
				});
			}),
		);
	}
});
