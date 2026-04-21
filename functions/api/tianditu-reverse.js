// functions/api/tianditu-reverse.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = context.env.TIANDITU_REVERSE_URL;
  const tk = context.env.TIANDITU_API_KEY;

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing API config: TIANDITU_REVERSE_URL' }),
      { status: 500 },
    );
  }

  if (!tk) {
    return new Response(
      JSON.stringify({ error: 'Missing API config: TIANDITU_API_KEY' }),
      { status: 500 },
    );
  }

  /* Construct URL */
  const paramsToForward = ['postStr', 'type'];
  const apiUrl = new URL(baseUrl);
  const requestUrl = new URL(context.request.url);
  paramsToForward.forEach((key) => {
    const value = requestUrl.searchParams.get(key);
    if (value) apiUrl.searchParams.set(key, value);
  });
  apiUrl.searchParams.set('tk', tk);
  const finalUrl = apiUrl.toString();
  console.log('[DEBUG] Final URL to Tianditu ->', finalUrl); // TODO: test

  try {
    const response = await fetch(finalUrl);
    const rawText = await response.text();
    console.log('[DEBUG] Tianditu Raw Response:', rawText); // TODO: test
    if (!response.ok) {
      throw new Error(
        `Tianditu reverse geocoding responded with ${response.status}`,
      );
    }

    const data = await response.json();

    const origin = context.request.headers.get('Origin');
    const host = context.request.headers.get('Host');

    /* Response to be returned to the frontend */
    const res = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-CF-Node': context.request.cf.colo,
      },
    });

    if (origin) {
      if (origin.includes('localhost') || origin.includes('pages.dev')) {
        res.headers.set('Access-Control-Allow-Origin', origin);
      } else if (host && host.includes('localhost')) {
        res.headers.set('Access-Control-Allow-Origin', '*');
      }
    }

    return res;
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: `Tianditu reverse geocoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }),
      { status: 500 },
    );
  }
}
