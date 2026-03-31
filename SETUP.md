# Setup Guide

[한국어](SETUP.ko.md)

## Prerequisites

- **Node.js** 20+
- **npm**
- A free [Upstash](https://upstash.com/) account (for Redis)
- A free [Cloudflare](https://cloudflare.com/) account (for Workers)

## 1. Clone and Install

```bash
git clone https://github.com/kimjiwook0129/financial-freedom.github.io.git
cd financial-freedom.github.io

# Dashboard dependencies
npm install

# Worker dependencies
cd worker && npm install && cd ..
```

## 2. Create Upstash Redis Database

1. Go to [console.upstash.com/redis](https://console.upstash.com/redis)
2. Click **Create Database**
3. Pick a name (e.g. `financial-freedom-redis`) and region
4. After creation, copy the **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

## 3. Configure Local Environment

```bash
# Create .env.development for the dashboard dev server
echo 'PUBLIC_API_URL=http://localhost:8787' > .env.development

# Create .dev.vars for the worker dev server
cat > worker/.dev.vars << 'EOF'
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
EOF
```

Replace the values with your actual Upstash credentials.

## 4. Run Locally

Open **two terminals**:

```bash
# Terminal 1 — Worker (from worker/)
cd worker
npm run dev -- --env dev
# Runs on http://localhost:8787

# Terminal 2 — Dashboard (from project root)
npm run dev
# Runs on http://localhost:4321
```

Open http://localhost:4321/financial-freedom.github.io/ in your browser.

## 5. Deploy

### Dashboard

Push to `main` triggers automatic deployment to GitHub Pages via GitHub Actions.

### Worker

```bash
cd worker
npx wrangler login    # One-time Cloudflare auth

# Set Upstash secrets (one-time)
echo "https://your-database.upstash.io" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "your-token-here" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN

# Deploy
npm run deploy
```

## Troubleshooting

| Problem | Solution |
|---|---|
| Share/Save buttons fail locally | Ensure the worker is running (`localhost:8787`) and `.env.development` exists |
| CORS errors locally | Make sure you started the worker with `--env dev` |
| `wrangler deploy` fails | Run `npx wrangler login` first |
| Worker returns 500 | Check that Upstash secrets are set via `npx wrangler secret list` |
