# CLAUDE.md — Financial Freedom Dashboard

## Git & Commit Rules

- **NEVER commit directly to the `main` branch.** Always create a feature branch.
- **NEVER create commits unless explicitly told to do so.**
- When committing, follow the existing commit message style (imperative mood, concise summary).
- **After making codebase changes, keep `CLAUDE.md`, `README.md`, and `README.ko.md` up-to-date** to reflect any new features, changed behavior, or structural changes.

## Project Overview

A bilingual (Korean/English) financial freedom calculator that projects net worth over time, determines financial freedom age, and visualizes results with interactive charts. Deployed as a static site on GitHub Pages.

**Live URL:** https://kimjiwook0129.github.io/financial-freedom.github.io/

## Tech Stack

- **Astro** v5 — static site generator (SSG), no server runtime
- **TypeScript** — modular architecture with pure logic in `src/lib/`, DOM orchestration in `index.astro`
- **Tailwind CSS** v3.4 — utility-first styling, class-based dark mode
- **Chart.js** v4.4 — line charts with custom vertical line annotation plugin
- **Pretendard** — Korean web font (CDN)
- **Cloudflare Workers** — API proxy for state persistence (hides Upstash credentials)
- **Upstash Redis** — serverless key-value store for shared dashboard state (72h TTL)
- **GitHub Actions** — CI/CD to GitHub Pages on push to `main`

## Project Structure

```
src/
  lib/
    types.ts             # Shared types: Lang, CurrencyCode, VResult, SimulationInput/Result
    i18n.ts              # Translation strings (ko/en), lang state, t() accessor
    formatters.ts        # formatLargeKo, formatLargeEn, formatMoneyShort (y-axis ticks)
    currency.ts          # CURRENCY config (KRW/USD), parsing, validation, formatting
    validation.ts        # vAge, vPercent, vMoney — pure input validators
    calculation.ts       # simulate() — pure financial simulation (net worth, freedom age)
    hash.ts              # URL hash field order constant (used by api.ts)
    api.ts               # API client: createState, getState, updateState (Cloudflare Worker)
    chart-plugin.ts      # Chart.js verticalLinePlugin (milestone annotations)
    chart-theme.ts       # getChartThemeColors() — dark/light color computation
  pages/
    index.astro          # HTML template + thin DOM orchestration script
  layouts/
    BaseLayout.astro     # HTML shell (head, meta, font, favicon, slot)
  styles/
    global.css           # Tailwind directives + custom component classes
public/
  favicon.svg            # Emoji favicon (💰)
worker/
  src/index.ts           # Cloudflare Worker: POST/GET/PUT /state → Upstash Redis
  wrangler.toml          # Worker config (name, CORS origins, env-specific vars)
  package.json           # Worker dependencies (wrangler)
  .dev.vars              # Local-only Upstash secrets for wrangler dev (gitignored)
.env.development         # Local dev override: PUBLIC_API_URL=http://localhost:8787 (gitignored)
.github/workflows/
  deploy.yml             # GitHub Pages deployment (Node 20, npm ci, build)
astro.config.mjs         # Site URL, base path, Tailwind integration
tailwind.config.mjs      # Dark mode (class), primary color palette, Pretendard font
tsconfig.json            # Strict mode, path alias @/* -> src/*
```

## Architecture

### Module Dependency Graph

```
types.ts          (no deps)
i18n.ts           (imports types)
formatters.ts     (imports i18n)
currency.ts       (imports i18n, formatters)
validation.ts     (imports i18n, currency)
calculation.ts    (imports types only — fully pure)
hash.ts           (no deps — field order constant)
api.ts            (imports hash — API client for state persistence)
chart-plugin.ts   (no deps — self-contained, reads DOM dark class at draw time)
chart-theme.ts    (no deps — fully pure)
```

### Shared State

- `lang` — mutable in `i18n.ts`, changed via `setLangState()`. Other modules import and read via ES module live bindings.
- `currency` — mutable in `currency.ts`, changed via `setCurrencyState()`. Same pattern.
- `isDark` — local to `index.astro` script block (only used for theme toggle).

### index.astro Script Block

After extraction, the inline `<script>` retains only DOM-coupled orchestration:
- DOM references (`fields`, `errors`)
- `applyError()` — DOM class manipulation for validation
- `setLang()` / `setCurrency()` — update DOM labels, suffixes, chart labels
- `formatMoneyInput()` — cursor-preserving comma formatting
- `validateAndUpdate()` — orchestrates validation + calls `simulate()` + updates DOM
- `update()` — calls `simulate()`, builds vertical lines, pushes data to charts, updates summary cards
- Chart.js instance creation (needs canvas context for gradients)
- Theme toggle event handler
- Save/Share button handlers (API-based state persistence)
- Event listeners for inputs

### Key Modules

| Module | Purpose |
|---|---|
| `calculation.ts` | Pure financial simulation. Takes `SimulationInput`, returns `SimulationResult` with ages, netWorths, incomes, expenses, brokeAge, freedomAge, etc. |
| `i18n.ts` | All UI strings in Korean and English (~40 keys). `t()` returns current language. |
| `currency.ts` | KRW (max 999,999,999,999, integer) and USD (max 999,999,999.99, 2 decimals). Parsing, validation, full/capped formatting. |
| `formatters.ts` | Large number formatting: Korean units (만~무량대수), English full names (Million~Duovigintillion), abbreviated (K~DVg). |
| `validation.ts` | `vAge`, `vPercent`, `vMoney` — pure validators returning `VResult`. |
| `hash.ts` | `FIELD_ORDER` constant used by `api.ts` for building state payloads. Legacy encode/decode removed. |
| `api.ts` | API client for Cloudflare Worker. `createState` (POST), `getState` (GET), `updateState` (PUT). |

## Key Design Decisions

- **Modular pure logic** — business logic (calculation, formatting, validation, i18n) extracted to `src/lib/` as pure functions; DOM coupling stays in `index.astro`
- **No frameworks for state** — plain DOM manipulation, no React/Vue/Svelte
- **Language ≠ Currency** — language (KO/EN) and currency (KRW/USD) are independent toggles; large number units follow the language toggle, not currency
- **Dark mode default** — dark theme is the default; light theme available via toggle
- **Static generation** — zero server-side logic; all calculations run client-side
- **API-backed state persistence** — dashboard state stored in Upstash Redis via Cloudflare Worker proxy; URL hash contains only a short ID, not the full state. Save (PUT) updates in place; Share (POST) creates a new entry. 72-hour TTL auto-deletes idle entries.
- **Conversion factor 1000** — approximate KRW/USD conversion for quick switching, not real exchange rates

## Commands

```bash
# Dashboard (from project root)
npm run dev      # Local dev server (localhost:4321)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally

# Worker (from worker/)
npm run dev -- --env dev   # Local worker dev server (localhost:8787, allows localhost CORS)
npm run deploy             # Deploy worker to Cloudflare production
```

## Deployment

### Dashboard
Push to `main` triggers `.github/workflows/deploy.yml` which builds and deploys to GitHub Pages. The base path is `/financial-freedom.github.io` (configured in astro.config.mjs).

### Cloudflare Worker
Deploy from `worker/` directory via `npm run deploy` (requires `wrangler login`). Upstash credentials are stored as Cloudflare secrets (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`), not in code.

**Worker URL:** `https://financial-freedom-api.financial-freedom.workers.dev`

### Local Development

To run both dashboard and worker locally:
1. Create `worker/.dev.vars` with your Upstash credentials (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`)
2. Create `.env.development` with `PUBLIC_API_URL=http://localhost:8787`
3. Start worker: `cd worker && npm run dev -- --env dev`
4. Start dashboard: `npm run dev` (from project root)

See [SETUP.md](SETUP.md) for full first-time setup instructions.
