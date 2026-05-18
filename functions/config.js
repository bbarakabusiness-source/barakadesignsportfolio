export async function onRequestGet({ env }) {
  const config = {
    environment: env.NODE_ENV || 'production',
    facebookPixelId: env.FACEBOOK_PIXEL_ID || '',
  };

  return new Response(`window.BARAKA_CONFIG = ${JSON.stringify(config)};`, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
