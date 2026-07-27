/* PrivacyLog PWA service worker — conservador.
   - Nao intercepta API, autenticacao nem POSTs (passa direto pela rede).
   - Cache-first apenas de assets estaticos imutaveis (_next/static, icones, marca).
   - Navegacoes: rede primeiro; se offline, mostra uma pagina de aviso simples.
   Bump CACHE_VERSION para invalidar o cache antigo em novos deploys. */
const CACHE_VERSION = "privacylog-static-v1";

const OFFLINE_HTML = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sem conexão · PrivacyLog</title>
<style>body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
font-family:system-ui,-apple-system,sans-serif;background:#faf6ef;color:#17130f;text-align:center;padding:24px}
h1{font-size:1.2rem;margin:0 0 .5rem}p{color:#6b6258;margin:0 0 1.25rem;max-width:22rem}
button{border:1px solid #17130f;background:#17130f;color:#faf6ef;border-radius:10px;padding:.6rem 1.2rem;font-size:.95rem;cursor:pointer}</style>
</head><body><h1>Você está sem conexão</h1>
<p>Não foi possível carregar o PrivacyLog agora. Verifique sua internet e tente de novo.</p>
<button onclick="location.reload()">Tentar novamente</button></body></html>`;

// Assets estaticos que valem cache-first.
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|svg|webp|avif|ico)$/.test(url.pathname)
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // So GET same-origin; o resto (API, POST, cross-origin) passa direto.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegacoes: rede primeiro, com fallback offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  // Assets estaticos: cache-first com atualizacao em segundo plano.
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_VERSION);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })()
    );
  }
  // Demais GETs: sem interceptacao (comportamento normal do navegador).
});
