interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ALLOWED_ORIGINS: string;
}

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) id += chars[b % chars.length];
  return id;
}

async function redis(env: Env, command: string[]): Promise<unknown> {
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGINS.split(',');
  if (allowed.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }
  return {};
}

const TTL_SECONDS = 72 * 60 * 60; // 72 hours

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    // POST /state — create new state
    if (request.method === 'POST' && parts[0] === 'state' && parts.length === 1) {
      const body = await request.json();
      const now = new Date().toISOString();
      const id = generateId();
      const record = { ...body, created_at: now, updated_at: now };
      await redis(env, ['SET', `state:${id}`, JSON.stringify(record), 'EX', `${TTL_SECONDS}`]);
      return json({ id }, 201, cors);
    }

    // GET /state/:id — read state
    if (request.method === 'GET' && parts[0] === 'state' && parts.length === 2) {
      const id = parts[1];
      const result = await redis(env, ['GET', `state:${id}`]);
      if (!result) return json({ error: 'not found' }, 404, cors);
      return json(JSON.parse(result as string), 200, cors);
    }

    // PUT /state/:id — update state
    if (request.method === 'PUT' && parts[0] === 'state' && parts.length === 2) {
      const id = parts[1];
      const existing = await redis(env, ['GET', `state:${id}`]);
      if (!existing) return json({ error: 'not found' }, 404, cors);
      const prev = JSON.parse(existing as string);
      const body = await request.json();
      const record = { ...body, created_at: prev.created_at, updated_at: new Date().toISOString() };
      await redis(env, ['SET', `state:${id}`, JSON.stringify(record), 'EX', `${TTL_SECONDS}`]);
      return json({ id }, 200, cors);
    }

    return json({ error: 'not found' }, 404, cors);
  },
};
