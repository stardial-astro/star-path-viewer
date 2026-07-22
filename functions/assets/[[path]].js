/*
 * Intercepts every /assets/* request so a hashed chunk that no longer exists
 * (old hash removed by a new deploy, or edge not yet propagated) returns a real
 * 404 instead of Cloudflare's single-page-application fallback (200 index.html).
 *
 * Why this matters: the /assets/* rule in public/_headers marks responses
 * `immutable, max-age=1y`. If a missing chunk falls through to the SPA handler
 * and gets 200 index.html, the browser caches that HTML under the .js URL for a
 * year — every later load then fails with "Expected a JavaScript module but got
 * text/html" and the app white-screens. Neither a rollback nor a Cloudflare
 * cache purge fixes it, because the poison lives in the user's local HTTP cache.
 *
 * A real static asset is served untouched (env.ASSETS.fetch returns it with the
 * _headers rules applied). Only the HTML fallback is turned into a 404, which is
 * never cached.
 */
export async function onRequest(context) {
  const response = await context.env.ASSETS.fetch(context.request);
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    return new Response('Asset not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return response;
}
