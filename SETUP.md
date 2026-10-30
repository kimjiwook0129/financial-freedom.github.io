# Setup Guide

[한국어](SETUP.ko.md)

## Prerequisites

- **Node.js** 20+
- **npm**

## 1. Clone and Install

```bash
git clone https://github.com/kimjiwook0129/financial-freedom.github.io.git
cd financial-freedom.github.io
npm install
```

## 2. Run Locally

```bash
npm run dev
# Runs on http://localhost:4321
```

Open http://localhost:4321/financial-freedom.github.io/ in your browser.

## 3. Deploy

Push to `main` triggers automatic deployment to GitHub Pages via GitHub Actions.

## Worker (optional, currently unused)

The `worker/` directory holds the Cloudflare Worker + Upstash Redis backend for the former Save/Share feature. The web client no longer calls it; it is kept only for a possible revival. Skip this section unless you are working on the worker.

Extra prerequisites: a free [Upstash](https://upstash.com/) account (Redis) and a free [Cloudflare](https://cloudflare.com/) account (Workers).

### Create Upstash Redis Database

1. Go to [console.upstash.com/redis](https://console.upstash.com/redis)
2. Click **Create Database**
3. Pick a name (e.g. `financial-freedom-redis`) and region
4. After creation, copy the **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

### Run Locally

```bash
cd worker && npm install

cat > .dev.vars << 'EOF'
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
EOF

npm run dev -- --env dev
# Runs on http://localhost:8787
```

Replace the values with your actual Upstash credentials.

### Deploy

```bash
cd worker
npx wrangler login    # One-time Cloudflare auth

# Set Upstash secrets (one-time)
echo "https://your-database.upstash.io" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "your-token-here" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN

npm run deploy
```

### Troubleshooting

| Problem | Solution |
|---|---|
| CORS errors locally | Make sure you started the worker with `--env dev` |
| `wrangler deploy` fails | Run `npx wrangler login` first |
| Worker returns 500 | Check that Upstash secrets are set via `npx wrangler secret list` |
