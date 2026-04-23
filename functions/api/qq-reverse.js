// functions/api/qq-reverse.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = context.env.QQ_REVERSE_URL.trim();
  const key = context.env.QQ_API_KEY.trim();

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Configuration missing: QQ_REVERSE_URL' }),
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
  const location = requestUrl.searchParams.get('location') || '';
  if (!location) {
    return new Response(
      JSON.stringify({ error: "Parameter missing: 'location'" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const radius = requestUrl.searchParams.get('radius') || 0;

  // const paramsToForward = ['location', 'radius'];
  // const apiUrl = new URL(baseUrl);
  // paramsToForward.forEach((k) => {
  //   const value = requestUrl.searchParams.get(k);
  //   if (value) apiUrl.searchParams.set(k, value);
  // });
  // apiUrl.searchParams.set('key', key);
  // const finalUrl = apiUrl.toString();
  const finalUrl = `${baseUrl}?key=${key}&location=${location}&radius=${radius}`;
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
          message: `QQ Error: ${response.status}`,
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
        message: `QQ reverse geocoding failed: ${err instanceof Error ? err.message : err}`,
      }),
      { status: 500 },
    );
  }
}
