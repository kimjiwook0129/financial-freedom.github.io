# Setup Guide

[한국어](SETUP.ko.md)

## Prerequisites

- **Node.js** 20+
- **npm**
- **ejson** — `brew install ejson`
- **jq** — `brew install jq`
- **wrangler** (installed automatically via `npm install` in `worker/`)

You will also need the **ejson private key** from a team member to decrypt secrets.

## 1. Clone and Install

```bash
git clone https://github.com/kimjiwook0129/financial-freedom.github.io.git
cd financial-freedom.github.io

# Dashboard dependencies
npm install

# Worker dependencies
cd worker && npm install && cd ..
```

## 2. Set Up ejson Private Key

Get the private key from a team member. The public key is `4f7160f09230a06b6731427d41e0b0fbb56b2433d3bf7a673cd57824e5ff5179`.

```bash
sudo mkdir -p /opt/ejson/keys
sudo sh -c 'echo "PRIVATE_KEY_HERE" > /opt/ejson/keys/4f7160f09230a06b6731427d41e0b0fbb56b2433d3bf7a673cd57824e5ff5179'
```

Verify it works:

```bash
./decrypt_ejson.sh
# Should output: [OK] .env.ejson → .env
```

## 3. Configure Local Environment

After decrypting, create the local dev files:

```bash
# Create .env.development for the dashboard dev server
echo 'PUBLIC_API_URL=http://localhost:8787' > .env.development

# Create .dev.vars for the worker dev server (copy values from .env)
cp .env worker/.dev.vars
```

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
npm run deploy        # Deploy to production
```

Upstash secrets are already configured as Cloudflare secrets. If they need to be updated:

```bash
cd worker
echo "NEW_VALUE" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "NEW_VALUE" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
```

## Troubleshooting

| Problem | Solution |
|---|---|
| `./decrypt_ejson.sh` fails | Ensure the private key is at `/opt/ejson/keys/<public_key>` |
| Share/Save buttons fail locally | Ensure the worker is running (`localhost:8787`) and `.env.development` exists |
| CORS errors locally | Make sure you started the worker with `--env dev` |
| `wrangler deploy` fails | Run `npx wrangler login` first |
