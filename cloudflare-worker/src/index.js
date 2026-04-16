export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (url.pathname !== '/contact' && url.pathname !== '/quote') {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    const formData = await request.formData();
    const honeypot = String(formData.get('_honey') || '');
    const token = String(formData.get('cf-turnstile-response') || '');

    if (honeypot) return new Response(null, { status: 204, headers: corsHeaders });
    if (!env.TURNSTILE_SECRET_KEY) return new Response('Missing Turnstile secret', { status: 500, headers: corsHeaders });

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || ''
      })
    });

    const verified = await verify.json();
    if (!verified.success) return new Response('Turnstile verification failed', { status: 403, headers: corsHeaders });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
