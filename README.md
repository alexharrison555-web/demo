# Cityscape AI

Next.js demo app: an AI-powered recruitment intake chat that profiles a candidate and routes them to the right consultant + role matches.

## Stack

- Next.js 14 (Pages Router)
- React 18 + TypeScript
- Tailwind CSS
- Anthropic Claude API (called directly from the browser)

## Setup

1. Open `pages/index.tsx`
2. Find the line `const ANTHROPIC_API_KEY = "PASTE_YOUR_KEY_HERE";`
3. Replace `PASTE_YOUR_KEY_HERE` with your Anthropic API key
4. Run:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push to a GitHub repo (make sure the repo is **private** — your key will be in the bundle).
2. Import the repo into Vercel.
3. Deploy. No environment variables needed.

## Security note

The API key is in the client-side bundle in this version. That means:

- Anyone who opens DevTools on the live site can see and copy the key.
- This is fine for a short interview demo with a low-credit key.
- Revoke the key at <https://console.anthropic.com/settings/keys> as soon as the demo is done.

For anything beyond a demo, move the key back to a serverless function. The original proxy lived at `pages/api/chat.ts` — restore it, read the key from `process.env.ANTHROPIC_API_KEY`, and point `CHAT_ENDPOINT` back to `/api/chat`.

## File layout

```
pages/
  index.tsx        Chat intake (Beat 1 to Beat 3, CV upload, hand-off)
  results.tsx     Role matches + consultant card
lib/
  prompt.ts        System prompt + model id
  data.ts          Job and recruiter lookup tables, types
styles/
  globals.css     Design tokens, keyframes, base styles
```

## How the flow works

1. User lands on `/` and the chat seeds itself with a placeholder message so Claude opens warmly.
2. Claude follows the 3-beat conversation defined in `lib/prompt.ts`.
3. When Claude emits `[SHOW_CV_UPLOAD]` the CV drop-zone renders.
4. When Claude emits a final `<CANDIDATE_DATA>{...}</CANDIDATE_DATA>` block, the JSON is saved to localStorage and the user is routed to `/results`.
5. `/results` reads from localStorage, picks the matched consultant + top 3 roles from `lib/data.ts`, and renders the page.
