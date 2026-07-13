# BuildBetter

BuildBetter is a PC upgrade recommendation site. Users enter or paste their PC specs, choose a budget and use case, and get a measured bottleneck analysis, a budget-aware upgrade plan, and typical prices with live store links for every recommended part.

Live architecture: one Netlify site. The React frontend deploys as a static site and the backend runs as Netlify Functions at `/api/*`. See [DEPLOY.md](DEPLOY.md) for setup.

## How It Works

- **Bottleneck analysis**: every CPU and GPU is scored 0 to 100 against a bundled benchmark tier dataset (about 135 parts). Parts not in the dataset get a heuristic estimate from their name. RAM and storage are scored from size and type. The component with the largest weighted shortfall for the chosen use case is the bottleneck, with a confidence level based on how much could be identified.
- **Budget-aware recommendations**: an upgrade planner ranks catalog parts by performance gained per dollar, keeps only parts that fit the budget, respects CPU socket (AM4/AM5/LGA1700) and RAM type (DDR4/DDR5), and answers honestly when the budget is too small for a meaningful upgrade.
- **Pricing**: the default provider is a curated, hand-updated parts catalog with typical street prices, each with live search links to Amazon, Newegg, and eBay. No scraping, no paid API. eBay and Best Buy providers are scaffolded and can be enabled with API keys once available.
- **Explanations**: written by a built-in rule-based writer that cites the actual scores. There is no external AI service.

BuildBetter does not automatically scan a user's computer from the browser. Browsers cannot see exact hardware, so the paste-based parser (Settings > System > About, or Windows System Information) is the supported flow.

## Repo Layout

- `client/` React + Vite + Tailwind frontend
- `netlify/functions/` the deployed backend (one function per API endpoint)
- `server/src/services/` and `server/src/data/` the shared analysis, pricing, and parsing logic imported by the functions
- `server/src/index.js` and `server/src/routes/` an optional Express wrapper for local-only use; it is not the deployed path
- `netlify.toml` build, functions, and local dev configuration

## Run Locally

Requires Node 20.19+ (Node 22 recommended, matching the pinned deploy version).

One-time setup:

```bash
npm install -g netlify-cli
cd client && npm install
```

Then from the repo root:

```bash
netlify dev
```

This starts the frontend and the functions together at `http://localhost:8888`, matching exactly how the deployed site behaves.

## Tests

```bash
npm test
```

Runs the unit tests (hardware matching, bottleneck analysis, budget planning) with the built-in Node test runner. No extra dependencies needed.

## API Routes

- `GET /api/health` service check
- `POST /api/parse-system-info` parses pasted Windows system info text
- `POST /api/analyze` scores a build and returns the bottleneck, budget plan, and explanation
- `POST /api/pricing/search` returns normalized pricing results from the active provider

## Environment Variables

None are required. The site runs fully on the curated catalog with zero configuration.

Optional, for live pricing later:

- `PRICING_PROVIDER` set to `curated` (default), `ebay`, `bestbuy`, `combined`, or `mock`
- `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_MARKETPLACE_ID` once the eBay developer account is approved
- `BESTBUY_API_KEY` if a Best Buy key is ever granted

Do not put API keys in frontend code. Do not commit real API keys.

## Updating Prices

Prices live in `server/src/data/curatedParts.js` with an as-of date. To update: edit the numbers, bump `pricesAsOf`, commit, and push. The store links always show live prices regardless.

## Future Features

- Live eBay pricing once the developer account is approved
- Saved builds and user accounts
- Email or shareable results
