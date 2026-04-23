// functions/api/baidu-reverse.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = context.env.BAIDU_REVERSE_URL.trim();
  const ak = context.env.BAIDU_API_KEY.trim();

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: BAIDU_REVERSE_URL' }),
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
  const location = requestUrl.searchParams.get('location');
  if (!location) {
    return new Response(
      JSON.stringify({ error: "Parameter missing: 'location'" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const output = requestUrl.searchParams.get('output') || 'json';
  const coordtype = requestUrl.searchParams.get('coordtype') || 'wgs84ll';
  const region_data_source =
    requestUrl.searchParams.get('region_data_source') || 2;
  // const paramsToForward = [
  //   'location',
  //   'output',
  //   'coordtype',
  //   'region_data_source',
  // ];
  // const apiUrl = new URL(baseUrl);
  // paramsToForward.forEach((key) => {
  //   const value = requestUrl.searchParams.get(key);
  //   if (value) apiUrl.searchParams.set(key, value);
  // });
  // apiUrl.searchParams.set('ak', ak);
  // const finalUrl = apiUrl.toString();
  const finalUrl = `${baseUrl}?ak=${ak}&location=${location}&output=${output}&coordtype=${coordtype}&region_data_source=${region_data_source}`;
  console.log('[DEBUG] Raw Fetch URL:', finalUrl); // TODO: test

  try {
    const response = await fetch(finalUrl, {
      headers: {
        Referrer: 'https://star-path-viewer.pages.dev',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: '*/*',
      },
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
        message: `Baidu reverse geocoding failed: ${err instanceof Error ? err.message : err}`,
      }),
      { status: 500 },
    );
  }
}
