# Graph Report - .  (2026-07-01)

## Corpus Check
- Corpus is ~9,750 words - fits in a single context window. You may not need a graph.

## Summary
- 178 nodes · 259 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.74)
- Token cost: 0 input · 171,033 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend Spec & Pricing Providers|Backend Spec & Pricing Providers]]
- [[_COMMUNITY_Frontend Form Flow|Frontend Form Flow]]
- [[_COMMUNITY_Client Package Config|Client Package Config]]
- [[_COMMUNITY_Pricing Provider Implementations|Pricing Provider Implementations]]
- [[_COMMUNITY_Vite Build Tooling|Vite Build Tooling]]
- [[_COMMUNITY_Express API Routes|Express API Routes]]
- [[_COMMUNITY_AI & Analysis Services|AI & Analysis Services]]
- [[_COMMUNITY_Server Package Config|Server Package Config]]
- [[_COMMUNITY_Root Package Scripts|Root Package Scripts]]
- [[_COMMUNITY_Results Display Components|Results Display Components]]
- [[_COMMUNITY_SocialNav Icon Set|Social/Nav Icon Set]]
- [[_COMMUNITY_Vite Scaffold Entry Point|Vite Scaffold Entry Point]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]
- [[_COMMUNITY_Hero Graphic Asset|Hero Graphic Asset]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]

## God Nodes (most connected - your core abstractions)
1. `BuildBetter Agent Instructions (Project Overview)` - 21 edges
2. `BuildBetter README Overview` - 12 edges
3. `analyzeBuild()` - 8 edges
4. `searchPricing()` - 8 edges
5. `Phase 5 - Required Backend Routes` - 6 edges
6. `Phase 7 - Pricing Service Structure` - 6 edges
7. `Phase 12 - Environment Variables` - 6 edges
8. `icons.svg (SVG icon sprite sheet)` - 6 edges
9. `scripts` - 5 edges
10. `request()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `client/index.html (App HTML Entry Document)` --conceptually_related_to--> `BuildBetter Agent Instructions (Project Overview)`  [INFERRED]
  client/index.html → AGENTS.md
- `Phase 17 - README Updates` --references--> `BuildBetter README Overview`  [EXTRACTED]
  AGENTS.md → README.md
- `BuildBetter README Overview` --references--> `POST /api/ai/explain`  [EXTRACTED]
  README.md → AGENTS.md
- `BuildBetter README Overview` --references--> `GET /api/health`  [EXTRACTED]
  README.md → AGENTS.md
- `BuildBetter README Overview` --references--> `POST /api/pricing/search`  [EXTRACTED]
  README.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Normalized Pricing Provider Pattern** — agents_pricing_service_concept, agents_mock_pricing_provider, agents_bestbuy_provider, agents_ebay_provider, agents_amazon_creators_provider [INFERRED 0.85]
- **BuildBetter Backend API Surface** — agents_api_health_route, agents_api_analyze_route, agents_api_parse_system_info_route, agents_api_pricing_search_route, agents_api_ai_explain_route [EXTRACTED 1.00]
- **Graceful Fallback When API Keys Are Missing** — agents_mock_pricing_provider, agents_bestbuy_provider, agents_ebay_provider, agents_openai_ai_service, agents_amazon_creators_provider [INFERRED 0.85]
- **Solid dark-fill social/platform brand icons (Bluesky, Discord, GitHub, X) sharing #08060d fill style** — client_public_icons_bluesky_icon, client_public_icons_discord_icon, client_public_icons_github_icon, client_public_icons_x_icon [INFERRED 0.75]

## Communities (16 total, 3 thin omitted)

### Community 0 - "Backend Spec & Pricing Providers"
Cohesion: 0.10
Nodes (35): amazonCreatorsProvider.js, POST /api/ai/explain, POST /api/analyze, GET /api/health, POST /api/parse-system-info, POST /api/pricing/search, bestBuyProvider.js, ebayProvider.js (+27 more)

### Community 1 - "Frontend Form Flow"
Cohesion: 0.13
Nodes (14): App(), initialFormData, AutoFillSystemInfo(), ErrorMessage(), Hero(), LoadingState(), SpecsForm(), StepCard() (+6 more)

### Community 2 - "Client Package Config"
Cohesion: 0.13
Nodes (14): dependencies, react, react-dom, tailwindcss, @tailwindcss/vite, name, private, scripts (+6 more)

### Community 3 - "Pricing Provider Implementations"
Cohesion: 0.28
Nodes (8): mockParts, searchAmazonCreatorsPricing(), searchBestBuyPricing(), normalizeEbayItem(), searchEbayPricing(), searchMockPricing(), normalizePricingResult(), searchPricing()

### Community 4 - "Vite Build Tooling"
Cohesion: 0.15
Nodes (13): client (BuildBetter frontend app), devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react (+5 more)

### Community 5 - "Express API Routes"
Cohesion: 0.23
Nodes (8): app, router, router, router, router, getFirstValue(), getValue(), parseSystemInfo()

### Community 6 - "AI & Analysis Services"
Cohesion: 0.25
Nodes (11): router, createExplanation(), fallbackExplanation(), analyzeBuild(), chooseFocus(), estimateUsedValue(), getUpgradePath(), parseBudget() (+3 more)

### Community 7 - "Server Package Config"
Cohesion: 0.17
Nodes (11): dependencies, cors, dotenv, express, name, private, scripts, dev (+3 more)

### Community 8 - "Root Package Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build:client, dev:client, dev:server, start:server, type (+1 more)

### Community 9 - "Results Display Components"
Cohesion: 0.36
Nodes (4): RecommendationCard(), ResultCard(), Results(), SummaryItem()

### Community 10 - "Social/Nav Icon Set"
Cohesion: 0.52
Nodes (7): Bluesky icon (symbol#bluesky-icon), Discord icon (symbol#discord-icon), Documentation icon (symbol#documentation-icon, open-book/pages glyph), GitHub icon (symbol#github-icon, Octocat mark), Social icon (symbol#social-icon, people/community glyph), icons.svg (SVG icon sprite sheet), X (Twitter) icon (symbol#x-icon)

### Community 11 - "Vite Scaffold Entry Point"
Cohesion: 0.40
Nodes (5): /src/main.jsx (Referenced Script Entry Point), client/index.html (App HTML Entry Document), client/README.md (Vite React Template Readme), React Compiler (not enabled), React + Vite Template

## Knowledge Gaps
- **46 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildBetter Agent Instructions (Project Overview)` connect `Backend Spec & Pricing Providers` to `Vite Scaffold Entry Point`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Vite Build Tooling` to `Client Package Config`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `client/index.html (App HTML Entry Document)` connect `Vite Scaffold Entry Point` to `Backend Spec & Pricing Providers`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Spec & Pricing Providers` be split into smaller, more focused modules?**
  _Cohesion score 0.10084033613445378 - nodes in this community are weakly interconnected._
- **Should `Frontend Form Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Client Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._