const CACHE_NAME = 'kaizer-website-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/animations.css',
  '/css/world-map.css',
  '/css/services.css',
  '/css/testimonials.css',
  '/css/pricing.css',
  '/css/founder.css',
  '/css/faq.css',
  '/css/get-started.css',
  '/css/carousel.css',
  '/css/options-comparison.css',
  '/js/main.js',
  '/js/scroll-to-top.js',
  '/js/carousel.js',
  '/js/pricing.js',
  '/images/image-removebg-preview.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap',
  'https://unpkg.com/aos@2.3.1/dist/aos.css'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching all assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the new response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
