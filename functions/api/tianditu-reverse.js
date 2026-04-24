// functions/api/tianditu-reverse.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = (context.env.TIANDITU_REVERSE_URL || '').trim();
  const tk = (context.env.TIANDITU_API_KEY || '').trim();

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: TIANDITU_REVERSE_URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!tk) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: TIANDITU_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  /* Construct URL */
  const requestUrl = new URL(context.request.url);
  const postStr = requestUrl.searchParams.get('postStr');
  if (!postStr) {
    return new Response(
      JSON.stringify({ error: "Parameter missing: 'postStr'" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const params = new URLSearchParams({
    postStr,
    type: 'geocode',
    tk,
  });
  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log('[DEBUG] Raw Fetch URL:', finalUrl); // TODO: test

  const headers = new Headers({
    Referer: 'https://star-path-viewer.pages.dev',
    'User-Agent':
      context.request.headers.get('User-Agent') ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: '*/*',
  });

  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
      // referrerPolicy: 'no-referrer',
      redirect: 'follow',
    });
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          status: -1, // frontend will handle this non-zero code
          message: `Tianditu Error: ${response.status}`,
        }),
        { status: response.status },
      );
    }

    const data = await response.json();

    /* Response to be returned to the frontend */
    const res = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-CF-Node': context.request.cf.colo,
      },
    });

    return res;
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: -2, // frontend will handle this non-zero code
        message: `Tianditu reverse geocoding failed: ${err instanceof Error ? err.message : err}`,
      }),
      { status: 500 },
    );
  }
}
