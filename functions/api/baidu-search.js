// functions/api/baidu-search.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = context.env.BAIDU_SEARCH_URL.trim();
  const ak = context.env.BAIDU_API_KEY.trim();

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing API config: BAIDU_SEARCH_URL' }),
      { status: 500 },
    );
  }

  if (!ak) {
    return new Response(
      JSON.stringify({ error: 'Missing API config: BAIDU_API_KEY' }),
      { status: 500 },
    );
  }

  /* Construct URL */
  const paramsToForward = ['query', 'output', 'ret_coordtype'];
  const apiUrl = new URL(baseUrl);
  const requestUrl = new URL(context.request.url);
  paramsToForward.forEach((key) => {
    const value = requestUrl.searchParams.get(key);
    if (value) apiUrl.searchParams.set(key, value);
  });
  apiUrl.searchParams.set('region', '全国');
  apiUrl.searchParams.set('ak', ak);
  const finalUrl = apiUrl.toString();
  console.log('[DEBUG] Final URL to Baidu ->', finalUrl); // TODO: test

  try {
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'curl/7.81.0',
        Accept: '*/*',
        Connection: 'keep-alive',
      },
      referrerPolicy: 'no-referrer',
      redirect: 'follow',
    });
    if (!response.ok) {
      throw new Error(`Baidu search responded with ${response.status}`);
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
        error: `Baidu search failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }),
      { status: 500 },
    );
  }
}
