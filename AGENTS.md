# BuildBetter Agent Instructions

> ## Status update (July 2026): read this first
>
> The file below describes the original build plan. Several parts are now
> out of date. The current state of the project is:
>
> - **OpenAI was removed entirely.** Explanations are written by a built-in
>   rule-based writer in `server/src/services/aiService.js`. Do not add an AI
>   explanation path or `OPENAI_*` variables.
> - **Default pricing is the curated catalog** (`server/src/data/curatedParts.js`),
>   hand-updated typical prices plus live Amazon/Newegg/eBay search links.
>   Mock pricing still exists but only via `PRICING_PROVIDER=mock`.
> - **Deployment is one Netlify site**: static frontend plus Netlify Functions
>   at `/api/*` (see `netlify.toml` and `DEPLOY.md`). The Express server in
>   `server/src/index.js` is optional local-only scaffolding, not the deploy path.
> - **Bottleneck analysis is benchmark-based** (`server/src/data/performanceTiers.js`,
>   `server/src/services/hardwareMatcher.js`) with heuristic estimates for
>   unknown parts, and recommendations are budget-aware
>   (`server/src/services/upgradePlanner.js`).
> - The case/system model field was removed end to end.
> - Writing standard: no em dashes in user-facing copy.
>
> Where this note and the README conflict with the phases below, this note
> and the README win.

## Project Name

BuildBetter

## Project Goal

BuildBetter is a full-stack PC upgrade recommendation website.

The user enters their current PC specs, budget, and main use case. The app should estimate the current value of the user's PC/build, identify likely bottlenecks, recommend smarter upgrades, show pricing information, and explain the recommendation clearly.

The final MVP should include:

* A polished React/Vite/Tailwind frontend
* A Node/Express backend
* Frontend-to-backend API connection
* System-info paste parser
* Rule-based PC analysis logic
* Mock pricing fallback
* Real pricing API scaffolding
* OpenAI-powered explanation support when an API key is available
* Clear README setup instructions
* Safe environment variable handling

The app must still work without real API keys by falling back to mock pricing and rule-based explanations.

---

## Current Project Setup

The frontend project is inside:

```text
client/
```

The project was created with:

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install tailwindcss @tailwindcss/vite
npm run dev -- --host 0.0.0.0
```

Important current files:

```text
client/src/App.jsx
client/src/index.css
client/vite.config.js
client/package.json
```

Current frontend status:

* Vite dev server works
* Live preview works on port 5173
* Tailwind is installed and working
* The default Vite page has been replaced
* The site currently has a BuildBetter hero section
* The site has three explanation cards
* The site has a PC parts form
* The site has mock results after clicking Analyze My PC

---

## User Inputs

The user form should include:

* CPU
* GPU
* RAM
* Storage
* Motherboard
* Power Supply
* Case, optional
* Upgrade Budget
* Main Use Case

Use case options:

* Gaming
* School
* CAD
* Streaming
* General Use

---

## Important Reality Check

A normal browser website cannot automatically scan a user's full local PC specs. Browsers block this for privacy and security.

For this MVP, use a safe paste-based feature:

* User opens Windows System Information
* User copies system summary/display text
* User pastes it into BuildBetter
* BuildBetter parses what it can and fills the form

Do not claim the website can automatically scan the computer from the browser.

Future versions may use:

* A downloadable Windows helper app
* A signed diagnostic/export tool
* A desktop app using Electron or Tauri
* A browser extension with explicit permissions

Do not build the desktop helper unless specifically instructed.

---

## Agent Behavior Rules

Do as much implementation as possible directly in the repository.

Do not only give code to copy unless blocked from editing files.

Before making changes, verify access by running/checking:

```bash
pwd
ls
ls client
ls client/src
cat client/package.json
cat client/src/App.jsx
```

Also check whether a backend already exists:

```bash
ls server
```

If the `client/` folder is not accessible, stop immediately and explain the access/setup issue.

Do not make me approve every tiny step. Make reasonable decisions and continue.

Keep the code beginner-friendly.

Prefer working, understandable code over fancy architecture.

Do not add TypeScript unless the project already uses TypeScript.

Do not add unnecessary libraries.

Do not put API keys in frontend code.

Do not commit real API keys.

Do not scrape Amazon, Best Buy, eBay, or any retail website pages.

Use official APIs or mock data.

---

## Required Overall Structure

Create or evolve the project toward this structure:

```text
AGENTS.md
README.md
.gitignore
package.json                 optional root scripts

client/
  package.json
  vite.config.js
  src/
    App.jsx
    index.css
    components/
      Hero.jsx
      StepCard.jsx
      SpecsForm.jsx
      AutoFillSystemInfo.jsx
      Results.jsx
      ResultCard.jsx
      SummaryItem.jsx
      RecommendationCard.jsx
      LoadingState.jsx
      ErrorMessage.jsx
    utils/
      api.js
    data/
      useCases.js

server/
  package.json
  .env.example
  src/
    index.js
    routes/
      health.js
      analyze.js
      systemInfo.js
      pricing.js
      ai.js
    services/
      analysisService.js
      systemInfoParser.js
      aiService.js
      pricing/
        pricingService.js
        mockPricingProvider.js
        bestBuyProvider.js
        ebayProvider.js
        amazonCreatorsProvider.js
        normalizePricingResult.js
    data/
      mockParts.js
```

This exact structure can be adjusted if there is a better simple reason, but keep it clean and easy to understand.

---

# Phase 1 — Clean Current Frontend

Inspect the current React app.

Fix any:

* Syntax errors
* Broken JSX
* Bad names
* Repeated code
* Messy structure
* Dead code
* Styling issues

Make sure:

* The app renders without Vite red error screens
* Tailwind styling works
* The form works
* Analyze My PC shows results
* The page is responsive
* The design is dark, modern, and clean

---

# Phase 2 — Split Frontend Into Components

Refactor `client/src/App.jsx` into smaller components.

Suggested components:

```text
Hero.jsx
StepCard.jsx
SpecsForm.jsx
AutoFillSystemInfo.jsx
Results.jsx
ResultCard.jsx
SummaryItem.jsx
RecommendationCard.jsx
LoadingState.jsx
ErrorMessage.jsx
```

Do not overcomplicate.

The goal is that a beginner can still understand the project.

---

# Phase 3 — Add System Info Auto-Fill

Add an "Auto-Fill From System Info" feature above the manual specs form.

Section title:

```text
Auto-Fill From System Info
```

Description:

```text
Paste your Windows System Information text below. BuildBetter will try to fill in the parts it recognizes.
```

Textarea placeholder:

```text
Paste your System Information text here...
```

Button:

```text
Auto-Fill My Specs
```

Parse text like:

```text
OS Name Microsoft Windows 11 Home
System Manufacturer ASUSTeK COMPUTER INC.
System Model ASUS TUF Dash F15 FX516PM_FX516PM
Processor 11th Gen Intel(R) Core(TM) i7-11370H @ 3.30GHz, 3302 Mhz, 4 Core(s), 8 Logical Processor(s)
BaseBoard Manufacturer ASUSTeK COMPUTER INC.
BaseBoard Product FX516PM
Installed Physical Memory (RAM) 16.0 GB
```

Map parsed values into:

* cpu
* ram
* motherboard
* case/model field
* os, if useful
* systemModel, if useful

Also support GPU/display text if pasted:

```text
Name NVIDIA GeForce RTX 3060
Adapter RAM
Driver Version
```

Map parsed GPU values into:

* gpu

The parser must not crash on messy pasted text.

If a field already has manually typed text, avoid overwriting it unless the parsed value is non-empty and the user intentionally clicked Auto-Fill.

---

# Phase 4 — Build Backend

Create a backend in:

```text
server/
```

Use:

* Node.js
* Express
* JavaScript
* dotenv
* cors if needed

Do not use TypeScript.

Backend should run on port 5000 by default.

Create:

```text
server/package.json
server/src/index.js
server/.env.example
```

Required backend scripts:

```json
{
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  }
}
```

If `node --watch` causes compatibility issues, use a simpler dev script or install nodemon only if needed.

---

# Phase 5 — Required Backend Routes

## 1. Health Check

Route:

```text
GET /api/health
```

Returns:

```json
{
  "status": "ok",
  "message": "BuildBetter API is running"
}
```

---

## 2. Analyze Build

Route:

```text
POST /api/analyze
```

Accepts:

```json
{
  "cpu": "...",
  "gpu": "...",
  "ram": "...",
  "storage": "...",
  "motherboard": "...",
  "powerSupply": "...",
  "case": "...",
  "budget": 500,
  "useCase": "Gaming"
}
```

Returns:

```json
{
  "currentBuildSummary": {},
  "estimatedUsedValue": {
    "range": "$450 - $700",
    "confidence": "demo estimate",
    "disclaimer": "This is a rough demo estimate, not guaranteed live market pricing."
  },
  "likelyBottleneck": "...",
  "recommendedFirstUpgrade": "...",
  "upgradePath": ["...", "...", "..."],
  "recommendedParts": [],
  "pricingProvider": "mock",
  "explanation": "...",
  "explanationSource": "fallback",
  "warnings": []
}
```

The backend analysis should consider:

* Budget
* Use case
* Missing fields
* RAM amount if detectable
* Whether storage looks like HDD or SSD
* Whether CPU/GPU are missing
* Whether use case is gaming, school, CAD, streaming, or general use

Simple rules:

* Gaming usually prioritizes GPU
* School/general use often benefits from SSD/RAM
* CAD may need CPU/RAM/GPU
* Streaming may need CPU or GPU encoder
* Low RAM should recommend RAM
* Missing or weak storage should recommend SSD
* If budget is low, recommend one focused upgrade
* If budget is high, recommend a staged upgrade path

Do not invent exact benchmark numbers.

Do not pretend mock prices are live prices.

---

## 3. Parse System Info

Route:

```text
POST /api/parse-system-info
```

Input:

```json
{
  "systemInfoText": "..."
}
```

Returns:

```json
{
  "cpu": "...",
  "gpu": "...",
  "ram": "...",
  "motherboard": "...",
  "case": "...",
  "systemModel": "...",
  "os": "...",
  "warnings": []
}
```

Parser must handle:

* Normal Windows System Information formatting
* Extra spacing
* Empty lines
* Missing values
* Display/GPU text if present

Do not crash.

---

## 4. Search Pricing

Route:

```text
POST /api/pricing/search
```

Input:

```json
{
  "query": "RTX 3060",
  "category": "gpu",
  "condition": "new",
  "limit": 5
}
```

`condition` may be:

```text
new
used
any
```

Returns:

```json
{
  "provider": "mock",
  "results": [
    {
      "title": "...",
      "price": 299.99,
      "currency": "USD",
      "condition": "new",
      "source": "Mock",
      "url": "",
      "image": "",
      "availability": "demo",
      "confidence": "medium"
    }
  ],
  "warnings": []
}
```

---

## 5. AI Explanation

Route:

```text
POST /api/ai/explain
```

Input:

```json
{
  "build": {},
  "analysis": {},
  "pricing": [],
  "userGoal": "Gaming",
  "budget": 500
}
```

Behavior:

* If `OPENAI_API_KEY` exists, call OpenAI from the backend
* If the key is missing, return a rule-based explanation
* Keep the explanation beginner-friendly
* Do not invent exact benchmark numbers
* Do not promise exact prices
* Mention when prices are estimates
* Mention when mock pricing is being used

Returns:

```json
{
  "source": "openai",
  "explanation": "..."
}
```

or:

```json
{
  "source": "fallback",
  "explanation": "..."
}
```

---

# Phase 6 — Real Pricing API Plan

Use this provider priority:

1. Best Buy Products API for real new-part pricing, product names, availability, images, descriptions, and specs.
2. eBay Browse API for used-market pricing and used part estimates.
3. OpenAI API for AI-generated explanations.
4. Amazon Creators API as a future optional provider.
5. Amazon Product Advertising API should not be the main provider because PA-API is being deprecated.

The app must work even with no real keys.

If no keys exist:

* Backend starts
* Frontend works
* Mock pricing is used
* Rule-based explanation is used
* Clear warnings are shown

Example warnings:

```text
Using mock pricing because no live pricing API key is configured.
Using rule-based explanation because no OpenAI API key is configured.
```

---

# Phase 7 — Pricing Service Structure

Create:

```text
server/src/services/pricing/pricingService.js
server/src/services/pricing/mockPricingProvider.js
server/src/services/pricing/bestBuyProvider.js
server/src/services/pricing/ebayProvider.js
server/src/services/pricing/amazonCreatorsProvider.js
server/src/services/pricing/normalizePricingResult.js
```

The pricing service should:

* Read `PRICING_PROVIDER`
* Call the selected provider
* Normalize all results into one shared format
* Return warnings instead of crashing
* Fall back to mock pricing if provider credentials are missing
* Fall back to mock pricing if provider request fails

Valid `PRICING_PROVIDER` values:

```text
mock
bestbuy
ebay
combined
```

Shared normalized pricing result:

```json
{
  "title": "...",
  "price": 299.99,
  "currency": "USD",
  "condition": "new",
  "source": "Best Buy",
  "url": "...",
  "image": "...",
  "availability": "...",
  "confidence": "high"
}
```

---

# Phase 8 — Best Buy Provider

Best Buy should be the main real-pricing provider.

Create:

```text
server/src/services/pricing/bestBuyProvider.js
```

The provider should:

* Read `BESTBUY_API_KEY` from `server/.env`
* Use the Best Buy Products API
* Use JSON response format
* Use keyword search for user-entered parts
* Use `show=` to limit returned attributes
* Use `pageSize=` to limit result count
* Normalize returned products
* Use useful fields such as:

  * sku
  * name
  * salePrice
  * regularPrice
  * onlineAvailability
  * inStoreAvailability
  * url
  * image
  * manufacturer
  * modelNumber
  * condition
* Do not cache Best Buy response URLs long-term
* Do not hardcode a real API key
* If `BESTBUY_API_KEY` is missing, return a warning and fall back to mock pricing

Example normalized result:

```json
{
  "title": "NVIDIA GeForce RTX 4060",
  "price": 299.99,
  "currency": "USD",
  "condition": "new",
  "source": "Best Buy",
  "url": "...",
  "image": "...",
  "availability": "online available",
  "confidence": "medium"
}
```

---

# Phase 9 — eBay Provider

Use eBay Browse API for used-market pricing.

Create:

```text
server/src/services/pricing/ebayProvider.js
```

The provider should:

* Read `EBAY_CLIENT_ID`
* Read `EBAY_CLIENT_SECRET`
* Read `EBAY_MARKETPLACE_ID`
* Search used parts by keyword
* Normalize results into the shared pricing format
* Use this mostly for estimating current used value
* Return warnings if credentials are missing
* Fall back to mock pricing if request fails
* Do not hardcode credentials

---

# Phase 10 — Amazon Future Provider

Do not prioritize Amazon Product Advertising API.

Amazon PA-API is deprecated, so do not spend major development time building a full PA-API integration.

Instead:

* Create optional placeholder scaffolding for future Amazon Creators API support
* Name the future provider:

```text
amazonCreatorsProvider.js
```

Do not:

* Scrape Amazon pages
* Hardcode Amazon credentials
* Require Amazon credentials for MVP
* Make Amazon a blocker

Environment variables may include:

```text
AMAZON_CREATORS_API_KEY=
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=
AMAZON_MARKETPLACE=www.amazon.com
```

These are optional and should not be required for the app to work.

---

# Phase 11 — OpenAI API Service

Use OpenAI only from the backend.

Create:

```text
server/src/services/aiService.js
```

The AI service should:

* Read `OPENAI_API_KEY` from `server/.env`
* Read `OPENAI_MODEL` from `server/.env`
* Never expose the OpenAI key to React/frontend code
* Call OpenAI only from Express backend routes/services
* Return fallback text if the key is missing
* Keep responses concise and beginner-friendly
* Avoid fake benchmark numbers
* Avoid pretending mock prices are live prices
* Mention when prices are estimates
* Mention when live provider data is being used

The AI explanation should:

* Explain the likely bottleneck
* Explain the recommended first upgrade
* Mention budget tradeoffs
* Mention that prices can change
* Avoid exact performance claims unless backed by real data

---

# Phase 12 — Environment Variables

Create:

```text
server/.env.example
```

with:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

OPENAI_API_KEY=
OPENAI_MODEL=

BESTBUY_API_KEY=

EBAY_CLIENT_ID=
EBAY_CLIENT_SECRET=
EBAY_MARKETPLACE_ID=EBAY_US

AMAZON_CREATORS_API_KEY=
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=
AMAZON_MARKETPLACE=www.amazon.com

PRICING_PROVIDER=mock
```

Add or update `.gitignore` with:

```text
.env
client/.env
server/.env
```

Never commit real keys.

---

# Phase 13 — Frontend API Connection

Update the frontend so it uses backend APIs.

The frontend should:

* Call `/api/parse-system-info` when auto-filling specs
* Call `/api/analyze` when clicking Analyze My PC
* Display results returned by the backend
* Display pricing results
* Display whether pricing is mock or live
* Display warnings clearly
* Display AI explanation source:

  * AI-generated explanation
  * Rule-based explanation
* Show loading states
* Show friendly API errors
* Keep manual form working
* Avoid crashing when fields are empty
* Avoid crashing when the backend returns warnings

Add visible labels:

```text
Demo estimate
Live pricing source: Best Buy
Live pricing source: eBay
Prices may change
```

---

# Phase 14 — Vite Proxy

Set up Vite proxy so the frontend can call backend APIs with `/api`.

Frontend should call:

```js
fetch("/api/analyze")
fetch("/api/parse-system-info")
fetch("/api/pricing/search")
fetch("/api/ai/explain")
```

Vite should forward `/api` to the Express backend on port 5000.

Update:

```text
client/vite.config.js
```

as needed.

---

# Phase 15 — Frontend UX Improvements

Improve the frontend design and user experience.

Add:

* Clean page spacing
* Better cards
* Clear section headings
* Better labels/placeholders
* Required indicators
* Helpful helper text
* Empty results state before analysis
* Demo-only badge for estimated value
* Responsive layout
* Button hover/focus states
* Friendly validation errors
* Loading spinner or loading text
* Clear warning boxes for missing API keys/mock mode

Keep the visual style:

* Dark
* Modern
* Clean
* Easy to read
* Beginner-friendly

---

# Phase 16 — Validation

Add frontend and backend validation.

Validation rules:

* Budget should be a positive number if provided
* At least CPU or GPU should be entered for analysis
* Use case must be one of:

  * Gaming
  * School
  * CAD
  * Streaming
  * General Use
* Empty fields should not crash the app
* Messy system-info text should not crash the app
* Backend errors should show friendly messages in the frontend

Return clear errors instead of crashing.

---

# Phase 17 — README Updates

Update or create:

```text
README.md
```

Include:

1. What BuildBetter is
2. What the MVP currently does
3. How to install dependencies
4. How to run the frontend
5. How to run the backend
6. How to run both together if root scripts exist
7. How to create `server/.env`
8. How mock pricing fallback works
9. How to enable Best Buy pricing
10. How to enable eBay used pricing
11. How to enable OpenAI explanations
12. Why Amazon is future/optional instead of core
13. Known limitation: browser cannot directly scan full PC hardware specs
14. Future features:

    * real pricing improvements
    * AI explanation improvements
    * saved builds
    * user accounts
    * downloadable Windows helper app
    * deployment

Include this warning:

```text
BuildBetter does not automatically scan a user's computer from the browser. The current MVP uses a paste-based Windows System Information parser. A future desktop helper app would be needed for true automatic local hardware detection.
```

---

# Phase 18 — Root Scripts

If helpful, create a root-level `package.json` with scripts like:

```json
{
  "scripts": {
    "dev:client": "cd client && npm run dev -- --host 0.0.0.0",
    "dev:server": "cd server && npm run dev",
    "build:client": "cd client && npm run build",
    "start:server": "cd server && npm start"
  }
}
```

Do not break the existing client setup.

---

# Phase 19 — Testing

After implementation, run:

```bash
cd server
npm install
```

Then:

```bash
cd ../client
npm install
npm run build
```

If the server has tests, run them.

If the client has lint/build scripts, run them.

Manual test checklist:

1. Start backend
2. Start frontend
3. Open frontend
4. Fill form manually
5. Click Analyze My PC
6. Confirm backend results appear
7. Confirm pricing appears
8. Confirm mock warnings appear when no keys are configured
9. Paste Windows System Information text
10. Click Auto-Fill My Specs
11. Confirm fields populate
12. Submit again
13. Confirm updated results appear
14. Confirm AI explanation falls back when no OpenAI key exists
15. Confirm app does not crash when backend is missing or returns errors

---

# Phase 20 — Commit

When finished, run:

```bash
git status
git add .
git commit -m "Build full-stack MVP with pricing and AI API setup"
```

If committing fails, explain exactly why and give the exact commands for me to run.

---

## Final Response Required From Agent

After completing work, summarize:

* Files changed
* Features added
* How to run the frontend
* How to run the backend
* How to test manually
* Which parts are real
* Which parts are mock/fallback
* Which API keys are needed for live pricing/AI
* Any known limitations
* Whether the commit succeeded
