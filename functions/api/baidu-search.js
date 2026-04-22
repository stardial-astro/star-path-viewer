// functions/api/baidu-search.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = context.env.BAIDU_SEARCH_URL.trim();
  const ak = context.env.BAIDU_API_KEY.trim();

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
  const query = requestUrl.searchParams.get('query') || '';
  if (!query) {
    return new Response(
      JSON.stringify({ error: "Parameter missing: 'query'" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const output = requestUrl.searchParams.get('output') || 'json';
  const ret_coordtype =
    requestUrl.searchParams.get('ret_coordtype') || 'gcj02ll';

  // const paramsToForward = ['query', 'output', 'ret_coordtype'];
  // const apiUrl = new URL(baseUrl);
  // paramsToForward.forEach((key) => {
  //   const value = requestUrl.searchParams.get(key);
  //   if (value) apiUrl.searchParams.set(key, value);
  // });
  // apiUrl.searchParams.set('region', '全国');
  // apiUrl.searchParams.set('ak', ak);
  // const finalUrl = apiUrl.toString();
  const finalUrl = `${baseUrl}?ak=${ak}&query=${encodeURIComponent(query)}&region=%E5%85%A8%E5%9B%BD&output=${output}&ret_coordtype=${ret_coordtype}`;
  console.log('[DEBUG] Raw Fetch URL:', finalUrl); // TODO: test

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

    // const origin = context.request.headers.get('Origin');
    // const host = context.request.headers.get('Host');
    // if (origin) {
    //   if (origin.includes('localhost') || origin.includes('pages.dev')) {
    //     res.headers.set('Access-Control-Allow-Origin', origin);
    //   } else if (host && host.includes('localhost')) {
    //     res.headers.set('Access-Control-Allow-Origin', '*');
    //   }
    // }

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
