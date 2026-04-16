export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const honeypot = String(formData.get('_honey') || '');
  const token = String(formData.get('cf-turnstile-response') || '');

  if (honeypot) {
    return new Response(null, { status: 204 });
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.FORMSUBMIT_ENDPOINT) {
    return new Response('Missing required Cloudflare configuration.', { status: 500 });
  }

  const verifyBody = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: request.headers.get('CF-Connecting-IP') || ''
  });

  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: verifyBody,
  });

  const verifyResult = await verifyResponse.json();

  if (!verifyResult.success) {
    return new Response('Turnstile verification failed.', { status: 403 });
  }

  const forwardData = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    if (key === '_honey' || key === 'cf-turnstile-response') continue;
    forwardData.append(key, String(value));
  }

  const forwardResponse = await fetch(env.FORMSUBMIT_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: forwardData.toString(),
  });

  if (!forwardResponse.ok) {
    return new Response('Unable to submit request.', { status: 502 });
  }

  return Response.redirect(new URL('/quote-thanks.html', request.url).toString(), 302);
}
