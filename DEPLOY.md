# Deploying BuildBetter (free, always running)

BuildBetter deploys as **one Netlify site**: the React frontend is served as a
static site, and the backend runs as Netlify Functions at `/api/*`. There is no
separate server to host, nothing sleeps, and the free tier covers all of it.

## One-time setup (about 10 minutes)

### 1. Push the latest code to GitHub

Make sure everything is committed and pushed to
`https://github.com/MichaelParks03/buildbetter`.

### 2. Create the Netlify site

1. Go to [app.netlify.com](https://app.netlify.com) and log in (you already
   have an account from your other two sites).
2. Click **Add new site → Import an existing project**.
3. Pick **GitHub** and choose the **buildbetter** repository.
4. Netlify reads `netlify.toml` from the repo automatically, so the build
   command and publish folder are already filled in. Don't change anything.
5. Click **Deploy**.

That's it. Netlify gives you a URL like `https://buildbetter-something.netlify.app`.
Every time you push to `main` on GitHub, the site redeploys itself.

### 3. Environment variables (all optional right now)

The site works with zero environment variables — it uses the curated parts
catalog with live store links and the built-in explanation writer. If you want to turn on optional features later, go
to **Site configuration → Environment variables** in Netlify and add:

| Variable | What it does |
| --- | --- |
| `PRICING_PROVIDER` | `curated` (default — hand-updated prices + live store links), `ebay`, `bestbuy`, `combined`, or `mock` |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` | eBay API keys, once your developer account is approved |
| `BESTBUY_API_KEY` | Best Buy API key, if you ever get one |

BuildBetter writes its own explanations, so there is no AI service to configure.

After adding or changing a variable, click **Deploys → Trigger deploy** so the
functions pick it up.

> **Note:** If you added an `OPENAI_API_KEY` in Netlify during an earlier attempt,
> you can delete it — it's no longer used and doesn't affect anything.

## Running the site on your own computer

You need [Node.js](https://nodejs.org) installed (the free LTS version). Then,
one time only:

```
npm install -g netlify-cli
```

After that, from the project folder:

```
netlify dev
```

This starts the frontend **and** the backend together at
**http://localhost:8888** — one command, no port juggling. (The old two-server
setup in `server/` still exists and still works with `npm run dev:server`, but
`netlify dev` matches exactly how the deployed site behaves.)

## How to check the deployed site is healthy

Open `https://YOUR-SITE.netlify.app/api/health` in a browser. You should see:

```json
{ "status": "ok", "message": "BuildBetter API is running" }
```
