// functions/api/qq-district.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = (context.env.QQ_DISTRICT_URL || '').trim();
  const key = (context.env.QQ_API_KEY || '').trim();

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: QQ_DISTRICT_URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!key) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: QQ_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  /* Construct URL */
  const requestUrl = new URL(context.request.url);
  const keyword = requestUrl.searchParams.get('keyword');
  if (!keyword) {
    return new Response(
      JSON.stringify({ error: "Parameter missing: 'keyword'" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const params = new URLSearchParams({ keyword, key });
  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log('[DEBUG] Raw Fetch URL:', finalUrl); // TODO: test

  let referer = context.request.headers.get('Referer');
  if (!referer || referer.includes('127.0.0.1')) {
    referer = 'https://starpathviewer.cc/';
  }
  console.log('[DEBUG] Referer:', referer); // TODO: test

  const headers = new Headers({
    Referer: referer,
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
          message: `QQ Error (district): ${response.status}`,
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
        message: `QQ district failed: ${err instanceof Error ? err.message : err}`,
      }),
      { status: 500 },
    );
  }
}
