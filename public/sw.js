/**
 * PsiApp Service Worker — PWA & Offline Support
 * Garante funcionamento offline de ferramentas de regulação emocional e diário.
 */

const CACHE_NAME = 'psiapp-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/paciente/inicio',
  '/paciente/entre-sessoes',
  '/paciente/diario',
];

// Instalação do Service Worker & Pré-cache de rotas críticas
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS).catch(err => {
        console.warn('Falha parcial no pré-cache offline:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network First com Fallback para Cache
self.addEventListener('fetch', event => {
  // Ignora requisições não GET ou requisições para APIs externas/Supabase
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback genérico para a página inicial
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline — sem conexão disponível.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});
