# Cityscape AI

Next.js demo app: an AI-powered recruitment intake chat that profiles a candidate and routes them to the right consultant + role matches.

## Stack

- Next.js 14 (Pages Router)
- React 18 + TypeScript
- Tailwind CSS
- Anthropic Claude API (proxied server-side via /api/chat)

## Local setup

```bash
# 1. Install
npm install

# 2. Add your Anthropic key
cp .env.local.example .env.local
# then edit .env.local and paste your key

# 3. Run
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push to a GitHub repo.
2. Import the repo into Vercel.
3. In **Settings → Environment Variables**, add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key
   - **Environments:** tick Production, Preview, and Development
4. Save, then **Deployments → latest → Redeploy** so the env var takes effect.

The API key only ever lives on the server — `pages/api/chat.ts` is a serverless function that proxies requests to Anthropic and never exposes the key to the browser.

## File layout

```
pages/
  index.tsx        Chat intake (Beat 1 → Beat 3, CV upload, hand-off)
  results.tsx     Role matches + consultant card
  api/
    chat.ts        Anthropic proxy (uses ANTHROPIC_API_KEY)
lib/
  prompt.ts        System prompt + model id
  data.ts          Job and recruiter lookup tables, types
styles/
  globals.css     Design tokens, keyframes, base styles
```

## How the flow works

1. User lands on `/` → chat seeds itself with a `[The candidate has just opened…]` message so Claude opens warmly.
2. Claude follows the 3-beat conversation defined in `lib/prompt.ts`.
3. When Claude emits `[SHOW_CV_UPLOAD]` the CV drop-zone renders.
4. When Claude emits a final `<CANDIDATE_DATA>{…}</CANDIDATE_DATA>` block, the JSON is saved to `localStorage` and the user is routed to `/results`.
5. `/results` reads from `localStorage`, picks the matched consultant + top 3 roles from `lib/data.ts`, and renders the page.
