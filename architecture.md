# Eburon AI — System Architecture

> **Beatrice** is a voice-first AI office aide built on the Google Gemini Multimodal Live API.
> She turns natural conversation into real action across documents, workflows, communication, and digital execution.

---

## 1. High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  React 19 + Vite + Zustand + Lucide + Vanilla CSS               │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ EburonApp    │  │ AudioRecorder│  │ MultimodalLiveClient│    │
│  │ (3100+ lines)│  │ (WebAudio)   │  │ (WebSocket → Gemini)│    │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬───────────┘    │
│         │                 │                     │                │
│         │    PCM audio    │   ┌─────────────────┘                │
│         │    @ 16 kHz     │   │  Realtime audio/video/text       │
│         ▼                 ▼   ▼                                  │
│  ┌────────────────────────────────────────────┐                  │
│  │        use-live-api.ts  (React Hook)       │                  │
│  │  Orchestrates: connect, tools, audio I/O   │                  │
│  └────────────────────┬───────────────────────┘                  │
└───────────────────────│──────────────────────────────────────────┘
                        │  HTTP (REST)
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER (Express + Vite)                      │
│                         server.ts                                │
│                                                                  │
│  ┌────────────┐  ┌────────────────┐  ┌───────────────────────┐  │
│  │ Firebase   │  │ Supabase (PG)  │  │ GoWA WhatsApp Proxy   │  │
│  │ Admin Auth │  │ Settings/Memory│  │ → whatsapp.eburon.ai  │  │
│  └────────────┘  └────────────────┘  └───────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Deployment Topology

| Component | Technology | URL |
|---|---|---|
| **Frontend + Backend** | Vite (SPA) + Express (single process) | `localhost:4343` (dev) |
| **Production Frontend** | Vercel (static SPA) | `https://turbo-tribble-pi.vercel.app` |
| **Production API** | Vercel rewrites → `whatsapp.eburon.ai` | `/api/*` proxy |
| **Auth** | Firebase Auth (Google OAuth) | `gen-lang-client-0836251512` |
| **Database** | Supabase PostgreSQL | `tcwhnoxzqibqtpgedvbv.supabase.co` |
| **Realtime DB** | Firebase Realtime Database | Blog storage (`blogs/{id}`) |
| **WhatsApp** | GoWA (go-whatsapp-web-multidevice) | `whatsapp.eburon.ai` (`168.231.78.113`) |
| **AI Engine** | Google Gemini Multimodal Live API | WebSocket (direct from browser) |

### Dev vs Production

```
DEV:   Browser → localhost:4343 (Express serves Vite + API in one process)
PROD:  Browser → Vercel (static) → /api/* rewrites to whatsapp.eburon.ai
       Browser → Gemini WebSocket (direct, no proxy)
```

---

## 3. Directory Structure

```
vep-v2-main/
├── index.html                 # SPA entry point
├── index.tsx                  # React DOM root render
├── index.css                  # Global stylesheet (18 KB, vanilla CSS)
├── App.tsx                    # Router shell (renders EburonApp)
├── EburonApp.tsx              # Main application component (~3100 lines)
├── server.ts                  # Express backend (45 KB)
├── vite.config.ts             # Vite config with env injection
├── vercel.json                # Vercel rewrites (API proxy + SPA fallback)
│
├── lib/                       # Core libraries
│   ├── genai-live-client.ts   # Gemini Multimodal Live WebSocket client
│   ├── audio-recorder.ts      # Mic capture → PCM 16kHz via AudioWorklet
│   ├── audio-streamer.ts      # PCM playback via AudioWorklet
│   ├── audioworklet-registry.ts # Worklet source registration
│   ├── state.ts               # Zustand stores (settings, auth, UI, tools, logs)
│   ├── tools.ts               # Tool declarations (Gemini function calling schema)
│   ├── whatsapp-tools.ts      # WhatsApp-specific tool declarations
│   ├── api-client.ts          # HTTP client for backend REST endpoints
│   ├── firebase.ts            # Firebase client SDK init
│   ├── blog-firebase.ts       # Firebase Realtime DB for blog CRUD
│   ├── supabase.ts            # Supabase client init
│   ├── constants.ts           # Model name, default voice, available voices
│   ├── languages.ts           # 100+ language list for scanner translation
│   ├── global-identity.ts     # Beatrice persona identity config
│   ├── prompts.ts             # Prompt utilities
│   ├── utils.ts               # Shared helpers (audioContext, base64)
│   ├── tools/                 # Tool presets by template
│   │   ├── customer-support.ts
│   │   ├── personal-assistant.ts
│   │   └── navigation-system.ts
│   └── worklets/              # AudioWorklet processors
│       ├── audio-processing.ts  # PCM recording worklet
│       └── vol-meter.ts         # Volume metering worklet
│
├── hooks/
│   ├── use-video-stream.ts    # Webcam/screenshare MediaStream hook
│   └── media/
│       └── use-live-api.ts    # Main orchestration hook (56 KB)
│                              # Connects Gemini, handles all tool execution
│
├── components/
│   ├── Header.tsx             # App header
│   ├── Modal.tsx              # Generic modal
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── ToolEditorModal.tsx    # Tool configuration editor
│
├── contexts/
│   └── LiveAPIContext.tsx     # React context provider for Live API
│
├── backend/
│   └── knowledge/global/      # Knowledge base files
│
├── artifacts/                 # User-generated documents (via tools)
├── notes/                     # User-saved notes (via tools)
├── public/                    # Static assets
│
├── SCHEMA.sql                 # Full Supabase database schema
├── firebase-applet-config.json # Firebase project config
├── firestore.rules            # Firestore security rules
└── beatrice.md                # Project documentation
```

---

## 4. Core Architecture Layers

### 4.1 — AI Engine (Gemini Multimodal Live)

The heart of the system. A persistent WebSocket connection from the browser directly to the Gemini Multimodal Live API.

```
Browser ←──WebSocket──→ Gemini 2.5 Flash (native-audio)
           ↕ audio      ↕ text       ↕ tool calls
           ↕ video       ↕ function responses
```

**Key files:**
- `lib/genai-live-client.ts` — WebSocket lifecycle, event emitter
- `hooks/media/use-live-api.ts` — React hook orchestrating the entire session

**Model:** `gemini-2.5-flash-native-audio-preview-09-2025`

**Capabilities:**
- Bidirectional streaming audio (PCM 16kHz)
- Real-time vision (webcam frames sent as JPEG base64 @ 1fps)
- Screen sharing (same frame pipeline)
- Function calling with `INTERRUPT` scheduling
- Grounded search results

### 4.2 — Audio Pipeline

```
Microphone → getUserMedia (mono, 16kHz, echo cancellation)
           → AudioWorklet (audio-processing.ts)
           → PCM int16 → base64 → sendRealtimeInput()
                                            │
Gemini response audio ←────────────────────┘
           → AudioStreamer (audio-streamer.ts)
           → AudioWorklet playback
           → Speaker
```

**Echo cancellation strategy:**
- Browser-native `echoCancellation`, `noiseSuppression`, `autoGainControl`
- Shared `AudioContext` between input and output (`id: 'audio-out'`)
- Background music ducks to 5% when mic is live, 15% when muted

### 4.3 — Vision Pipeline

```
Webcam/Screen → MediaStream → <video ref>
                    │
              setInterval (1s)
                    │
              canvas.drawImage → toDataURL('image/jpeg', 0.6)
                    │
              base64 → client.sendRealtimeInput([{ mimeType: 'image/jpeg', data }])
```

### 4.4 — State Management (Zustand)

All state is managed via Zustand stores in `lib/state.ts`:

| Store | Purpose |
|---|---|
| `useSettings` | Persona name, voice, language, system prompt, model |
| `useAuth` | Google OAuth access token |
| `useUI` | Sidebar toggle, workspace result, generating state |
| `useTools` | Tool registry, template switching, toggle/add/remove |
| `useLogStore` | Conversation turn history |

---

## 5. Backend Architecture (`server.ts`)

A single Express server that in dev mode also hosts the Vite dev middleware.

### 5.1 — Authentication

Firebase Admin SDK verifies `Authorization: Bearer <idToken>` on all `/api/*` routes.

```
Client → Firebase Auth (Google sign-in) → idToken
       → Authorization header → server.ts authenticateToken middleware
       → Firebase Admin verifyIdToken(token)
```

### 5.2 — Database (Supabase PostgreSQL)

Auto-creates tables on startup:

| Table | Purpose |
|---|---|
| `user_settings` | Persona, voice, language, system prompt per user |
| `user_memories` | Long-term memory storage (personal/work/project) |
| `user_conversations` | Session-based conversation history |
| `whatsapp_messages` | WhatsApp message log (both directions) |

### 5.3 — REST API Routes

#### Core
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/avatar` | Serves Beatrice avatar image |

#### Settings & Memory
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/settings` | Fetch user settings |
| `PUT` | `/api/settings` | Update user settings |
| `GET` | `/api/memories` | List user memories |
| `POST` | `/api/memories` | Create memory |
| `DELETE` | `/api/memories/:id` | Delete memory |

#### Conversations
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/conversations` | Fetch conversation history |
| `POST` | `/api/conversations` | Save conversation turn |

#### Search
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/search` | Google Custom Search proxy |

#### WhatsApp (GoWA Proxy)
All WhatsApp routes proxy to the GoWA server with Basic Auth.

| Category | Routes |
|---|---|
| Device | `GET /device/status`, `GET /device/login`, `POST /device/logout`, `POST /device/reconnect` |
| Send (JSON) | `POST /send/message`, `/send/contact`, `/send/location`, `/send/poll`, `/send/link` |
| Send (Multipart) | `POST /send/image`, `/send/file`, `/send/video`, `/send/sticker`, `/send/audio` |
| Messages | `POST /message/:id/delete`, `/revoke`, `/react`, `/update`, `/read`, `/star` |
| Chats | `GET /chats`, `GET /chat/:jid/messages`, `POST /chat/:jid/pin`, `/archive` |
| Groups | Full CRUD: create, join, participants, name, photo, invite-link, leave |
| Contacts | `GET /contacts`, `/user/info`, `/user/check`, `/user/avatar` |
| Connect | `GET /connect` — Auto-registers device, returns QR or open state |
| Webhook | `POST /webhook` — Receives GoWA webhook events, saves to DB |

---

## 6. Tool System (Function Calling)

Beatrice has ~50+ tools organized into categories. Tools are declared as Gemini function calling schemas and executed client-side in `use-live-api.ts`.

### 6.1 — Tool Categories

| Category | Tools | Execution |
|---|---|---|
| **Workspace** | `create_markdown_document`, `create_html_document`, `create_json_file`, `save_note`, `read_note`, `list_notes`, `create_checklist`, `create_project_brief`, `create_readme`, `validate_json`, `create_env_template`, `create_chart_spec` | Client-side (file creation) |
| **Google Workspace** | `run_google_workspace_action` (Docs, Sheets, Calendar, Gmail, Drive) | Backend Apps Script bridge |
| **System** | `execute_safe_command` (date/uptime/hostname/pwd/whoami/ls), `open_browser_url`, `get_current_datetime`, `calculate` | Client-side |
| **Memory** | `save_memory`, `search_memories` | Backend REST |
| **Communication** | Full WhatsApp suite (send message/image/video/audio/file/contact/location/poll, manage chats/groups/contacts) | Backend → GoWA proxy |
| **Knowledge** | `search_knowledge_base`, `upload_to_knowledge_base` | Backend |
| **Video** | `create_video_storyboard`, `create_video_script_document`, `create_deployment_video_plan`, `register_google_video_asset` | Client-side (document creation) |
| **Location** | `get_user_location`, `search_places` | Client-side (browser Geolocation + OpenStreetMap + Open-Meteo) |
| **Blog** | `generate_blog_post` | Backend → Firebase RTDB |

### 6.2 — Tool Execution Flow

```
Gemini ──tool_call──→ use-live-api.ts
                           │
                    switch(tool.name)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         Client-side   Backend REST   External API
         (fs/browser)  (api-client)   (fetch)
              │            │            │
              └────────────┼────────────┘
                           │
                    functionResponse
                           │
                           ▼
                    client.sendToolResponse()
                           │
                    Gemini continues
```

### 6.3 — Tool Templates

Three presets that swap the entire tool set + system prompt:

| Template | Focus |
|---|---|
| `personal-assistant` | Full suite (default) |
| `customer-support` | Customer-facing tools |
| `navigation-system` | Location and directions |

---

## 7. Frontend Architecture (`EburonApp.tsx`)

A single monolithic React component (~3100 lines) that renders the entire application. It manages:

### 7.1 — UI Sections

```
┌─────────────────────────────────────┐
│              Header                 │  ← Logo, status, profile/settings
├─────────────────────────────────────┤
│         Skills Rail                 │  ← Horizontal scrolling chip bar
│  [Meet][Gmail][Calendar][WhatsApp]  │
│  [Scanner][Location][Knowledge]...  │
├─────────────────────────────────────┤
│                                     │
│       Chat Streaming Area           │  ← Conversation messages
│       (Markdown rendered)           │
│                                     │
├─────────────────────────────────────┤
│         Input Bar                   │  ← Text input + file attach + send
├─────────────────────────────────────┤
│        Bottom Navigation            │  ← Mic | Home | Camera | History
└─────────────────────────────────────┘
```

### 7.2 — Full-Page Overlays

Triggered by skill chips or nav buttons. Each is a `full-page-overlay` div:

| Overlay | Trigger | Content |
|---|---|---|
| `overlay-workspace` | Tool creates artifact | Document viewer/preview |
| `overlay-profile` | Profile icon | User profile + memories |
| `overlay-settings` | Settings icon | Persona, voice, language config |
| `overlay-history` | History nav item | Searchable conversation history |
| `overlay-map` | Location skill chip | Embedded Google Maps iframe |
| `overlay-picker` | Google Drive chip | Drive file picker |
| `overlay-whatsapp` | WhatsApp chip | QR connect + full chat interface |
| `overlay-scanner` | QR Code chip | Camera barcode/QR scanner + translation |
| `overlay-meet` | Meet/Camera chip | Full-screen video call view |
| `overlay-tools` | Tools chip | Tool toggle dashboard |

### 7.3 — Auth Flow

```
Landing (not logged in)
    │
    ├── Email/Password signup/login
    ├── Google OAuth popup
    │
    ▼
Firebase Auth → idToken
    │
    ▼
Main App (logged in)
    │
    ├── Load settings from backend
    ├── Load memories from backend
    ├── Connect to Gemini Live
    └── Start audio session
```

---

## 8. Data Flow Diagram

```
┌─────────────┐      WebSocket (audio/video/text/tools)      ┌──────────────┐
│             │ ←──────────────────────────────────────────→  │              │
│   Browser   │                                               │  Gemini API  │
│  (React)    │      HTTP REST (settings/memory/search)       │              │
│             │ ──────────────────────────────────────────→   └──────────────┘
│             │        │
│             │        ▼
│             │  ┌──────────────┐     ┌────────────────┐
│             │  │  server.ts   │────→│ Supabase (PG)  │
│             │  │  (Express)   │     └────────────────┘
│             │  │              │     ┌────────────────┐
│             │  │              │────→│ Firebase Admin  │
│             │  │              │     └────────────────┘
│             │  │              │     ┌────────────────┐
│             │  │              │────→│ GoWA (WhatsApp) │
│             │  └──────────────┘     └────────────────┘
│             │
│             │     Firebase Client SDK (Auth + RTDB)
│             │ ──────────────────────────────────────────→ Firebase
└─────────────┘
```

---

## 9. Security Model

| Layer | Mechanism |
|---|---|
| **Frontend Auth** | Firebase Auth (Google OAuth + email/password) |
| **API Auth** | Firebase Admin `verifyIdToken()` middleware on all `/api/*` routes |
| **WhatsApp Auth** | Basic Auth header (server-side only, never exposed to client) |
| **Database** | Row-level filtering by `uid` in all queries |
| **API Keys** | `GEMINI_API_KEY` injected at build time via Vite `define` |
| **CORS** | Enabled globally on Express |
| **Firestore** | Security rules in `firestore.rules` |

---

## 10. Environment Variables

```env
# AI
GEMINI_API_KEY=               # Google Gemini API key

# Firebase
FIREBASE_PROJECT_ID=          # Firebase project ID (from firebase-applet-config.json)

# Supabase (PostgreSQL)
SUPABASE_URL=                 # https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=     # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=    # Supabase service role key
SUPABASE_DB_PASSWORD=         # Database password (for direct PG connection)
DATABASE_URL=                 # Optional: full PostgreSQL connection string

# WhatsApp (GoWA)
GOWA_API_URL=                 # https://whatsapp.eburon.ai
GOWA_USERNAME=                # Basic auth username
GOWA_PASSWORD=                # Basic auth password
GOWA_DEVICE_ID=               # Default device ID
GOWA_TIMEOUT_MS=              # Request timeout
GOWA_WEBHOOK_URL=             # Webhook callback URL

# Google Workspace
GOOGLE_CLIENT_ID=             # OAuth client ID
GOOGLE_APPS_SCRIPT_URL=       # Apps Script web app URL

# Search
GOOGLE_SEARCH_API_KEY=        # Custom Search API key
GOOGLE_SEARCH_ENGINE_ID=      # Custom Search engine ID

# Server
PORT=4343                     # Server port
```

---

## 11. Build & Deploy

### Development
```bash
npm install
# Set GEMINI_API_KEY in .env.local
npm run dev    # tsx server.ts → Express + Vite middleware on :4343
```

### Production Build
```bash
npm run build  # vite build (frontend) + esbuild server.ts (backend CJS) → dist/
npm run start  # node dist/server.cjs
```

### Vercel Deployment
- `vercel.json` rewrites `/api/*` → `https://whatsapp.eburon.ai/api/$1`
- All other routes → SPA fallback to `index.html`
- Frontend-only deployment (Gemini connection is direct from browser)

---

## 12. Key Design Decisions

| Decision | Rationale |
|---|---|
| **Single-file component** (`EburonApp.tsx`, 3100 lines) | Rapid iteration; entire UI in one place. Trade-off: hard to navigate. |
| **Gemini direct from browser** (no server proxy) | Lowest latency for real-time audio. API key is build-time injected. |
| **Zustand over Redux** | Minimal boilerplate, perfect for this scale. |
| **Vanilla CSS over Tailwind** | Full control, dark theme, glassmorphism effects. |
| **Express + Vite in one process** | Single `npm run dev` for everything. |
| **GoWA proxy pattern** | WhatsApp credentials never touch the browser. |
| **AudioWorklet for recording** | Required for low-latency PCM capture without main-thread blocking. |
| **Shared AudioContext** | Enables browser hardware echo cancellation between mic and speaker. |
| **Tool templates** | Swap entire personality + toolset with one click. |

---

## 13. External Service Dependencies

| Service | Purpose | Required? |
|---|---|---|
| Google Gemini API | AI engine (voice + vision + tools) | **Yes** |
| Firebase Auth | User authentication | **Yes** |
| Firebase Firestore | WhatsApp message storage | **Yes** |
| Firebase RTDB | Blog post storage | Optional |
| Supabase PostgreSQL | Settings, memories, conversations | **Yes** |
| GoWA | WhatsApp API bridge | Optional |
| OpenStreetMap Nominatim | Reverse geocoding | Optional |
| Open-Meteo | Weather/temperature | Optional |
| Google Custom Search | Web search tool | Optional |
| Google Apps Script | Workspace automation | Optional |
