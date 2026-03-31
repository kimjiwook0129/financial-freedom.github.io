interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ALLOWED_ORIGINS: string;
}

// --- ID generation (12 bytes = 72 bits entropy, hex-encoded) ---

function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const ID_PATTERN = /^[0-9a-f]{24}$/;

// --- Input validation ---

const VALID_LANGS = ['ko', 'en'];
const VALID_CURRENCIES = ['KRW', 'USD'];
const FIELD_ORDER = [
  'currentAge', 'retirementAge', 'targetAge',
  'currentNetWorth', 'cagr',
  'annualIncome', 'incomeIncrease',
  'annualExpense', 'expenseIncrease',
];
const MAX_BODY_BYTES = 4 * 1024; // 4 KB
const MAX_FIELD_LENGTH = 50;

interface StatePayload {
  lang: string;
  currency: string;
  fields: Record<string, string>;
}

function validatePayload(raw: unknown): StatePayload {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('body must be a JSON object');
  }
  const obj = raw as Record<string, unknown>;

  if (!VALID_LANGS.includes(obj.lang as string)) throw new Error('invalid lang');
  if (!VALID_CURRENCIES.includes(obj.currency as string)) throw new Error('invalid currency');

  if (typeof obj.fields !== 'object' || obj.fields === null || Array.isArray(obj.fields)) {
    throw new Error('fields must be an object');
  }
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj.fields as Record<string, unknown>)) {
    if (!FIELD_ORDER.includes(key)) throw new Error(`unknown field: ${key}`);
    if (typeof value !== 'string') throw new Error(`field ${key} must be a string`);
    if (value.length > MAX_FIELD_LENGTH) throw new Error(`field ${key} too long`);
    fields[key] = value;
  }

  return { lang: obj.lang as string, currency: obj.currency as string, fields };
}

// --- Redis client ---

async function redis(env: Env, command: string[]): Promise<unknown> {
  const res = await fetch(env.UPSTASH_REDIS_REST_URL, {
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

// --- Rate limiting (per IP, 60-second sliding window) ---

const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60; // seconds

async function checkRateLimit(ip: string, env: Env): Promise<boolean> {
  const key = `rl:${ip}`;
  const count = (await redis(env, ['INCR', key])) as number;
  if (count === 1) await redis(env, ['EXPIRE', key, `${RATE_WINDOW}`]);
  return count <= RATE_LIMIT;
}

// --- CORS ---

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  if (allowed.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }
  return {};
}

// --- Helpers ---

const TTL_SECONDS = 72 * 60 * 60; // 72 hours

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

function safeParse(raw: unknown): unknown | null {
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --- Worker entry ---

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Rate limit (skip for preflight which already returned above)
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!(await checkRateLimit(clientIp, env))) {
      return json({ error: 'rate limit exceeded' }, 429, cors);
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    // POST /state — create new state
    if (request.method === 'POST' && parts[0] === 'state' && parts.length === 1) {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ error: 'request too large' }, 413, cors);

      let payload: StatePayload;
      try {
        payload = validatePayload(JSON.parse(text));
      } catch (e) {
        return json({ error: (e as Error).message }, 400, cors);
      }

      const now = new Date().toISOString();
      const id = generateId();
      const record = { ...payload, created_at: now, updated_at: now };
      await redis(env, ['SET', `state:${id}`, JSON.stringify(record), 'EX', `${TTL_SECONDS}`]);
      return json({ id }, 201, cors);
    }

    // GET /state/:id — read state
    if (request.method === 'GET' && parts[0] === 'state' && parts.length === 2) {
      const id = parts[1];
      if (!ID_PATTERN.test(id)) return json({ error: 'invalid id' }, 400, cors);

      const result = await redis(env, ['GET', `state:${id}`]);
      if (!result) return json({ error: 'not found' }, 404, cors);

      const parsed = safeParse(result);
      if (!parsed) return json({ error: 'corrupted data' }, 500, cors);
      return json(parsed, 200, cors);
    }

    // PUT /state/:id — update state
    if (request.method === 'PUT' && parts[0] === 'state' && parts.length === 2) {
      const id = parts[1];
      if (!ID_PATTERN.test(id)) return json({ error: 'invalid id' }, 400, cors);

      const existing = await redis(env, ['GET', `state:${id}`]);
      if (!existing) return json({ error: 'not found' }, 404, cors);

      const prev = safeParse(existing);
      if (!prev) return json({ error: 'corrupted data' }, 500, cors);

      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ error: 'request too large' }, 413, cors);

      let payload: StatePayload;
      try {
        payload = validatePayload(JSON.parse(text));
      } catch (e) {
        return json({ error: (e as Error).message }, 400, cors);
      }

      const record = {
        ...payload,
        created_at: (prev as Record<string, unknown>).created_at,
        updated_at: new Date().toISOString(),
      };
      await redis(env, ['SET', `state:${id}`, JSON.stringify(record), 'EX', `${TTL_SECONDS}`]);
      return json({ id }, 200, cors);
    }

    return json({ error: 'not found' }, 404, cors);
  },
};
