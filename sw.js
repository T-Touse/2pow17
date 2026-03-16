const CACHE_NAME = '2048-v3';
const ASSETS = [
	'./',
	'./index.html',
	'./assets/icon.svg',
	'./assets/bubble_pop.mp3',
	'./main.css',
	'./main.mjs',
	'./src/components/Grid.mjs',
	'./src/components/ScoreBoard.mjs',
	'./src/components/Tile.mjs',
	'./src/components/utils.mjs',
	'./src/core/Grid.mjs',
	'./src/core/History.mjs',
	'./src/core/Tile.mjs',
	'./src/lib/UIX.mjs',
	'./src/control.mjs',
];

// Installation : on met en cache tous les fichiers
self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
	);
	self.skipWaiting(); // Force la mise à jour immédiate
});

// Activation : on nettoie les anciens caches
self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then(keys => Promise.all(
			keys.map(key => {
				if (key !== CACHE_NAME) return caches.delete(key);
			})
		))
	);
});

// Stratégie : Réseau d'abord, sinon Cache (pour avoir toujours la dernière version si possible)
self.addEventListener('fetch', (e) => {
	e.respondWith(
		fetch(e.request).catch(() => caches.match(e.request))
	);
});