// functions/api/baidu-reverse.js

/** @param {*} context */
export async function onRequest(context) {
  const baseUrl = context.env.BAIDU_REVERSE_URL;
  const ak = context.env.BAIDU_API_KEY;

  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing API config: BAIDU_REVERSE_URL' }),
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
  const apiUrl = new URL(baseUrl);
  const { searchParams } = new URL(context.request.url);
  searchParams.forEach((value, key) => {
    if (key !== 'ak') apiUrl.searchParams.set(key, value);
  });
  apiUrl.searchParams.set('ak', ak);

  try {
    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Error(
        `Baidu reverse geocoding responded with ${response.status}`,
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
        error: `Baidu reverse geocoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }),
      { status: 500 },
    );
  }
}
