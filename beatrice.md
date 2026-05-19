# AGENTS.md — Eburon AI / native-audio-function-call-sandbox

## What this is

A real-time voice AI app ("Eburon AI" / "Beatrice") using Gemini Multimodal Live API. Single Node.js server serves both the Express backend and the Vite React frontend.

## Quick start

```sh
npm install
# Set GEMINI_API_KEY in .env.local (see .env.example for all vars)
npm run dev
```

Opens at `http://localhost:4343`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | `tsx server.ts` — starts Express + Vite middleware (single process) |
| `npm run build` | `vite build` (frontend) + `esbuild server.ts` (backend CJS) → `dist/` |
| `npm run start` | `node dist/server.cjs` — runs production build |
| `npm run lint` | `eslint .` — only available check |
| `npm run preview` | `vite preview` |

No test runner, no typecheck script.

## Architecture

- **Entrypoint**: `server.ts` — starts Express, mounts Vite middleware (dev) or static dist (prod), serves API routes
- **Frontend**: `index.tsx` → `App.tsx` → `EburonApp.tsx`. React 19, Zustand for state, Lucide icons
- **AI**: `@google/genai` SDK with Multimodal Live API (audio modality). Context in `contexts/LiveAPIContext.tsx`, hook in `hooks/media/use-live-api.ts`
- **Auth**: Firebase Auth (email/password + Google OAuth with extensive Workspace scopes). Client-side Firestore used for settings/memories/conversations
- **Databases**: Firestore (primary user data), Supabase Postgres (optional via DATABASE_URL), local filesystem (`artifacts/`, `notes/`)
- **Tool dispatching**: Gemini function calls → Express `POST /api/local-tools/run` (authenticated) + Google native tools + Apps Script bridge

## Important gotchas

- Default port is 4343 (set via PORT env or vite.config.ts). Not 3000 or 5173.
- `.env.local` is loaded by the server AND read by Vite for client-side vars (GEMINI_API_KEY exposed to frontend). Keep actual secrets out of VITE_-prefixed vars.
- `.env.local` is gitignored. `.env.example` is the template.
- Session capped at 20 minutes client-side (auto-disconnect). Test by reconnecting.
- Changing tool definitions requires updates in **three places**: `lib/tools.ts` (Gemini declarations), `server.ts` (Express handler switch), and `EburonApp.tsx` (ToolIcons mapping).
- `path` import uses `@/*` alias mapping to root. Vite resolve + tsconfig paths both configured.

## State stores (Zustand, in `lib/state.ts`)

- `useSettings` — persona name, voice, language, system prompt, model
- `useTools` — enabled function declarations, template switching
- `useLogStore` — conversation turns (user/agent)
- `useAuth` — Google access token
- `useUI` — sidebar, workspace overlay

## Build output

- Frontend: `dist/assets/` (vite build)
- Backend: `dist/server.cjs` (esbuild bundle)
- Both served from `dist/` in production via `server.ts`

## WhatsApp integration (GoWA)

- GoWA API runs on VPS at `https://whatsapp.eburon.ai` (Traefik → nginx → gowa container)
- Device `beatrice` uses Basic Auth with admin:password (set in `.env.local`)
- Send: `POST /api/whatsapp/send` → GoWA `POST /send/message` (needs X-Device-Id header)
- Connect/QR: `GET /api/whatsapp/connect` → GoWA device check + `/app/login` flow
- Webhook: GoWA sends incoming messages to `POST /api/whatsapp/webhook` (configured via container env). VPS backend at `/api/` proxy handles it.
- Messages are stored in Firebase Firestore `whatsapp_messages` collection
- Server endpoints are in `server.ts` (lines 547-770), frontend integration in `EburonApp.tsx`
- For local dev webhook testing, use ngrok tunnel pointing to your local port 4343, then update GoWA docker-compose `APP_WEBHOOK_URL`

## Data safety

- Firestore rules enforce uid-based access (`firestore.rules`)
- Server uses Firebase Admin SDK with Application Default Credentials (no key file needed locally if gcloud configured)
- Local tool commands whitelisted to: `date, uptime, hostname, pwd, whoami, ls`
