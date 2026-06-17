# BuildBetter

BuildBetter is a full-stack PC upgrade recommendation MVP. Users enter or paste PC specs, choose a budget and use case, then get a backend-powered upgrade recommendation with demo pricing and an explanation.

## What the MVP Does

- React/Vite/Tailwind frontend for entering PC parts.
- Paste-based Windows System Information parser.
- Node/Express backend with `/api` routes.
- OpenRouter-powered PC analysis for bottlenecks, value estimates, upgrade paths, and warnings when configured.
- Rule-based fallback analysis when no AI key is configured.
- Mock pricing fallback that works without real API keys.
- Best Buy and eBay pricing provider scaffolding for later live pricing.
- Backend-only OpenRouter/Qwen chat, recommendations, and explanation support with rule-based fallback.

BuildBetter does not automatically scan a user's computer from the browser. The current MVP uses a paste-based Windows System Information parser. A future desktop helper app would be needed for true automatic local hardware detection.

## Install

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Environment

Create a backend environment file from the example:

```bash
cd server
cp .env.example .env
```

The app works with empty API keys by using mock pricing and fallback recommendations/explanations.

Important variables:

- `PORT=3001`
- `CLIENT_ORIGIN=http://localhost:5173`
- `PRICING_PROVIDER=mock`
- `BESTBUY_API_KEY=` for future Best Buy pricing
- `EBAY_CLIENT_ID=` and `EBAY_CLIENT_SECRET=` for future eBay used pricing
- `OPENROUTER_API_KEY=replace_with_your_openrouter_key` for backend-only OpenRouter requests
- `OPENROUTER_MODEL=qwen/qwen3-next-80b-a3b-instruct:free`
- `OPENROUTER_SITE_URL=http://localhost:5173`

Do not put API keys in frontend code. Do not commit real API keys.

## Run The Backend

```bash
cd server
npm run dev
```

The backend runs at:

```text
http://localhost:3001
```

Health check:

```text
GET /api/health
```

## Run The Frontend

In another terminal:

```bash
cd client
npm run dev -- --host 0.0.0.0
```

The frontend runs through Vite on port `5173`. Vite proxies `/api` requests to the backend on port `3001`.

Root scripts are also available:

```bash
npm run dev:server
npm run dev:client
npm run build:client
npm run start:server
```

## API Routes

- `GET /api/health` checks that the backend is running.
- `POST /api/parse-system-info` parses pasted Windows System Information text.
- `POST /api/analyze` analyzes a build and returns recommendations.
- `POST /api/pricing/search` returns normalized pricing results.
- `POST /api/chat` sends a message to the backend, which calls OpenRouter privately and returns an answer.
- `POST /api/ai/explain` returns an OpenRouter explanation when configured or a fallback explanation.

## Manual Test Checklist

1. Start the backend with `cd server && npm run dev`.
2. Start the frontend with `cd client && npm run dev -- --host 0.0.0.0`.
3. Open the frontend preview.
4. Fill in CPU or GPU, budget, and use case.
5. Click `Analyze My PC`.
6. Confirm current build, estimated value, bottleneck, pricing, warnings, and explanation appear.
7. Confirm mock pricing warnings appear when no live API keys are configured.
8. Paste Windows System Information text.
9. Click `Auto-Fill My Specs`.
10. Confirm recognized fields populate.
11. Submit again and confirm updated backend results.
12. Stop the backend and confirm the frontend shows a friendly API error.

## Real vs Mock

Real in this MVP:

- Frontend form and system-info paste flow.
- Express backend routes.
- Rule-based PC analysis.
- Backend validation and warnings.
- Backend-only OpenRouter recommendation and chat paths when a key is configured.

Mock or fallback in this MVP:

- Pricing defaults to mock data.
- Used value estimates are rough demo estimates.
- Best Buy and eBay providers are scaffolds until API credentials and provider details are enabled.
- AI recommendations and explanations fall back to rules when `OPENROUTER_API_KEY` is missing or the API call fails.

## Live Pricing And AI Keys Needed Later

- Best Buy new-part pricing: `BESTBUY_API_KEY`
- eBay used-market pricing: `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_MARKETPLACE_ID`
- OpenRouter chat and explanations: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`
- Amazon Creators API is future optional scaffolding, not a blocker for this MVP.

Amazon Product Advertising API is not the main provider because PA-API is being deprecated. BuildBetter should not scrape Amazon pages.

## Future Features

- Better real pricing and used-value estimates.
- Stronger AI explanations.
- Saved builds.
- User accounts.
- Downloadable Windows helper app for true local hardware detection.
- Deployment to a public host.
