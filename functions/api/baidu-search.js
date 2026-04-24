// functions/api/baidu-search.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = (context.env.BAIDU_SEARCH_URL || '').trim();
  const ak = (context.env.BAIDU_API_KEY || '').trim();

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: BAIDU_SEARCH_URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!ak) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: BAIDU_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  /* Construct URL */
  const requestUrl = new URL(context.request.url);
  const query = requestUrl.searchParams.get('query');
  if (!query) {
    return new Response(
      JSON.stringify({ error: "Parameter missing: 'query'" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const ret_coordtype =
    requestUrl.searchParams.get('ret_coordtype') || 'gcj02ll';
  const params = new URLSearchParams({
    query,
    region: '全国',
    output: 'json',
    ret_coordtype,
    ak,
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
          message: `Baidu Error: ${response.status}`,
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
        message: `Baidu search failed: ${err instanceof Error ? err.message : err}`,
      }),
      { status: 500 },
    );
  }
}
