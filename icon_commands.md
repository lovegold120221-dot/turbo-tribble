# Eburon AI — Icon Commands & Full Capability Reference

> Complete reference of every icon, button, and skill chip in the Beatrice interface,
> plus a full catalog of every capability available through voice, text, and tool execution.

---

## Table of Contents

1. [Skills Rail — Row 1 (Top Icons)](#1-skills-rail--row-1-top-icons)
2. [Skills Rail — Row 2 (Bottom Icons)](#2-skills-rail--row-2-bottom-icons)
3. [Bottom Navigation Bar](#3-bottom-navigation-bar)
4. [Input Bar Controls](#4-input-bar-controls)
5. [Header Controls](#5-header-controls)
6. [Full-Page Overlay Panels](#6-full-page-overlay-panels)
7. [Voice-Activated AI Tools (Gemini Function Calling)](#7-voice-activated-ai-tools-gemini-function-calling)
8. [Beatrice Persona & Behavioral Capabilities](#8-beatrice-persona--behavioral-capabilities)

---

## 1. Skills Rail — Row 1 (Top Icons)

The first horizontal scrollable row below the header. These are quick-access skill chips.

| # | Icon | Label | Lucide Icon | Action Type | What It Does |
|---|------|-------|-------------|-------------|--------------|
| 1 | 👤 | **Profile** | `User` | Opens overlay | Opens the **User Profile** full-page overlay. Shows avatar, email, name, and the **Memory Manager** where users can add, edit, delete, and categorize long-term memories (personal / work / project). |
| 2 | ✅ | **Tasks** | `ListChecks` | Sends prompt | Sends `"Pull up my Google Tasks and give me a quick overview of what's on my list."` to Beatrice via Gemini. She uses the Google Workspace bridge to fetch and display tasks. |
| 3 | 📅 | **Calendar** | `Calendar` | Sends prompt | Sends `"What's on my calendar today? Show me my schedule."` to Beatrice. She queries Google Calendar via Apps Script and summarizes the day's events in voice. |
| 4 | 📁 | **Drive** | `FolderOpen` | Sends prompt | Sends `"Find my recent files in Google Drive and show me what's there."` to Beatrice. She lists Drive files with names, types, and last-modified dates. |
| 5 | 🌐 | **Google** | `Globe` | Sends prompt | Sends `"Search the web for the latest AI and tech news and give me a quick rundown of the top stories."` Uses the `google_search` tool to fetch live results and speaks a summary. |
| 6 | ✍️ | **Sign** | `PenTool` | Sends prompt | Sends `"I need a signature pad tool where I can draw my signature on screen."` Beatrice generates an interactive HTML artifact with a canvas-based signature pad. |
| 7 | 🏢 | **Company** | `Building` | Sends prompt | Sends `"Ask me which company I want to look up first. Once I tell you the company name, search for their registration info, address, industry, and key people."` Interactive company research flow. |
| 8 | 💬 | **Chat** | `MessageSquare` | Sends prompt | Sends `"Show me my Google Chat spaces and summarize what's been going on in them."` Uses the Google Workspace bridge to access Chat data. |
| 9 | 📋 | **Forms** | `ClipboardList` | Sends prompt | Sends `"Create a feedback form that's interactive with validation and a nice design."` Beatrice generates an HTML form artifact with input validation. |
| 10 | 📝 | **Keep** | `StickyNote` | Sends prompt | Sends `"Pull up my Google Keep notes and show me what I've saved."` Queries Keep via Apps Script. |

---

## 2. Skills Rail — Row 2 (Bottom Icons)

The second horizontal scrollable row. Includes system controls, integrations, and specialized tools.

| # | Icon | Label | Lucide Icon | Color | Action Type | What It Does |
|---|------|-------|-------------|-------|-------------|--------------|
| 11 | ⚙️ | **Settings** | `Settings` | Default | Opens overlay | Opens the **App Settings** overlay where you configure: Persona name, User call name, Behavior prompt, Voice (Aoede/Charon/Fenrir/Kore/Puck + 25 more), Language (100+ options), and Blog Mode toggle. |
| 12 | 🔧 | **Tools** | `Wrench` | Default | Opens overlay | Opens the **Integrations** overlay showing all 50+ registered Gemini tools. Each tool has a name, description, and enable/disable toggle switch. |
| 13 | 🕐 | **History** | `History` | Default | Opens overlay | Opens the **Activity History** overlay with: search bar, role filter (user/agent/tools), date filter (today/week/all), and tool-type chips. Full scrollable conversation log with timestamps. |
| 14 | 📊 | **Proposal** | `Presentation` | Default | Sends prompt | Sends `"I need a business proposal with sections for scope, timeline, and pricing, with a download button."` Beatrice generates a professional HTML proposal artifact. |
| 15 | ✉️ | **Gmail** | `Mail` | Default | Sends prompt | Sends `"Check my unread emails and summarize what's new in my inbox."` Uses Google Workspace bridge to access Gmail. |
| 16 | 📊 | **Sheets** | `Table` | Default | Sends prompt | Sends `"Create a new Google Sheet for tracking expenses and set it up with the right columns."` Creates sheet via Apps Script. |
| 17 | 📑 | **Slides** | `Presentation` | Default | Sends prompt | Sends `"Build me a presentation template with a few slides I can flip through."` Generates an interactive slideshow HTML artifact. |
| 18 | 📜 | **Contract** | `FileSignature` | Gold gradient | Sends prompt | Sends `"I need a formal contract agreement with an e-signature feature. Make it look professional with a signature pad I can draw on."` Generates a legal contract HTML artifact with embedded signature canvas. |
| 19 | 🧾 | **Invoice** | `Receipt` | Blue gradient | Sends prompt | Sends `"I need an invoice with line items, auto-calculated totals, and a download button."` Generates a professional invoice HTML artifact with auto-calculations. |
| 20 | 📹 | **Meet** | `Video` | Default | Opens overlay | Opens the **Meet** full-screen video call overlay. Activates webcam, starts sending video frames to Gemini at 1fps for real-time vision analysis. Features: Beatrice AI avatar, webcam feed, screen share button, end call button. |
| 21 | 👥 | **Contacts** | `Users` | Default | Sends prompt | Sends `"Show me my Google Contacts and help me find someone."` Uses Google Workspace bridge. |
| 22 | 💚 | **WhatsApp** | `MessageCircle` | WhatsApp green | Opens overlay | Opens the **WhatsApp** overlay. Three states: (1) Connect — generates QR code for pairing via GoWA, (2) Connected — shows full chat interface with conversation list, message bubbles, and send bar, (3) Loading. |
| 23 | 🔍 | **Picker** | `FileSearch` | Default | Opens overlay | Opens the **Google Drive Picker** overlay. Lists Drive files with icons (Docs/Sheets/Slides/PDF), allows selecting files to work with in conversation. |
| 24 | 🗄️ | **Firebase** | `Database` | Default | Sends prompt | Sends `"Create a Firebase-style dashboard with live data cards and activity feed."` Generates an interactive dashboard HTML artifact. |
| 25 | 📱 | **Scanner** | `QrCode` | Purple gradient | Opens overlay | Opens the **Supermarket Scanner** overlay. Activates camera for barcode/QR code scanning. Scanned data is sent to Beatrice who identifies the product and speaks the description aloud. Includes a **translation language dropdown** with 100+ languages including Dutch (Flemish). |
| 26 | 📄 | **Docs** | `ScrollText` | Green gradient | Sends prompt | Sends `"Ask me what type of document I need and which company it's for..."` Interactive document generation flow. Supports: contracts, NDAs, ToS, privacy policies, LOIs, partnership agreements, SLAs, and any other business document. |
| 27 | 📍 | **Location** | `MapPin` | Red gradient | Special handler | Calls `handleLocationSkillClick()` which: (1) Gets GPS coordinates via browser Geolocation API, (2) Reverse-geocodes via OpenStreetMap Nominatim, (3) Fetches weather from Open-Meteo, (4) Opens the **Map** overlay with embedded Google Maps iframe, (5) Sends all context to Beatrice so she knows your location, temperature, and time. |

---

## 3. Bottom Navigation Bar

Fixed at the bottom of the screen. Three primary action buttons.

| # | Icon | Label | Lucide Icon | Behavior | What It Does |
|---|------|-------|-------------|----------|--------------|
| 1 | 🎤 / 🔇 | **Mute / Unmute** | `Mic` / `MicOff` | Toggle | **Toggles the microphone.** When active: captures PCM audio at 16kHz via AudioWorklet, streams to Gemini in real-time. Animated pulse ring shows live volume level. Background music ducks to 5% when mic is live, restores to 15% when muted. Echo cancellation is hardware-enabled. |
| 2 | 🖥️ | **Share Screen / Stop Share** | `MonitorUp` | Toggle | **Toggles screen sharing.** Captures display via `getDisplayMedia()`, renders in a floating video element, sends frames to Gemini at 1fps as JPEG base64. Beatrice can describe and analyze what's on screen in real-time. Animated pulse when active. |
| 3 | 📹 | **Video / End Call** | `Video` | Toggle | **Opens full-screen video call view.** Activates webcam via `getUserMedia()`, opens the Meet overlay with Beatrice's AI avatar. Frames are sent to Gemini for real-time vision. Beatrice can see and describe what she sees. Screen sharing also available within the call. |

---

## 4. Input Bar Controls

The text input area at the bottom of the chat, above the nav bar.

| # | Icon | Element | Lucide Icon | What It Does |
|---|------|---------|-------------|--------------|
| 1 | 📎 | **Attach File** | `Paperclip` | Opens file picker. Accepts `image/*`. Selected image is sent to Beatrice as visual context for analysis. |
| 2 | — | **Text Input** | — | Type-to-chat input. Placeholder: `"Message or ask Beatrice..."`. Press Enter or tap Send to submit. Works whether connected or disconnected (auto-connects if needed). |
| 3 | ➡️ | **Send** | `Send` | Sends the typed text message to Beatrice via the Gemini Live WebSocket. Also saves the turn to conversation history in Supabase. |

---

## 5. Header Controls

Top bar of the application.

| # | Element | What It Does |
|---|---------|--------------|
| 1 | **Eburon Logo** | Displays the Eburon AI brand mark (SVG from `eburon.ai/icon-eburon.svg`). |
| 2 | **"Eburon AI"** | Application title text. |
| 3 | **Session Timer** | Shows elapsed time (MM:SS) when connected to Gemini. The session limit is 20 minutes. Beatrice warns at 19 min and says goodbye at 19:50. |
| 4 | **Connection Dot** | Green pulsing dot when connected, hidden when disconnected. |

---

## 6. Full-Page Overlay Panels

These are the full-screen panels triggered by skill chips or nav buttons.

### 6.1 — Profile Overlay
- **User avatar** (auto-generated from name)
- **Name & email** display
- **Memory Manager**: View all memories, add new ones, edit existing (inline textarea), delete (trash icon), categorize (Personal / Work / Project)
- **Memory success toast** on save

### 6.2 — Settings Overlay
- **Persona Name** — What the AI calls itself (default: "Beatrice")
- **How to Call You** — What the AI calls the user (default: "Boss")
- **Behavior Persona** — Full system prompt textarea with character count. Controls personality, tone, language matching, etc.
- **Voice Persona** — Dropdown: Aoede, Charon, Fenrir, Kore, Puck (+ 25 more voices)
- **Language** — Dropdown with 100+ languages
- **Productive Idle Blog Mode** — Toggle switch. When enabled, Beatrice auto-generates blog posts during idle time and saves them to Firebase RTDB
- **Save Settings** — Persists all settings to Supabase PostgreSQL

### 6.3 — History Overlay
- **Search bar** with magnifying glass icon
- **Role filter**: Every Role / User Only / Agent Only / Tools Only
- **Date filter**: All Sessions / Today / This Week
- **Tool type chips** (when Tools Only filter is active): search, save_memory, meeting, artifact, command
- **Scrollable conversation list** with timestamps, role badges, and message content

### 6.4 — WhatsApp Overlay
- **QR Code pairing** via GoWA (go-whatsapp-web-multidevice)
- **Full chat interface**: Contact list, message bubbles, typing indicator
- **Send bar**: Text input + send button
- **Status states**: Loading → QR → Connected → Error
- **Backend**: All messages saved to Firestore `whatsapp_messages` collection

### 6.5 — Scanner Overlay
- **Camera viewfinder** for barcode/QR code scanning
- **Product identification**: Scanned data sent to Beatrice who identifies the product
- **Translation dropdown**: 100+ languages including Dutch (Flemish), English, Filipino, French, German, etc.
- **Voice output**: Beatrice speaks the product description in the selected language

### 6.6 — Map Overlay
- **Embedded Google Maps iframe** centered on user's GPS coordinates
- **Context-aware**: Beatrice knows the user's location, temperature, and local time
- **Places search**: User can ask about nearby establishments and Beatrice uses location data

### 6.7 — Meet (Video Call) Overlay
- **Full-screen layout** with two panels: Beatrice AI avatar (top) and user webcam (bottom)
- **Real-time vision**: Webcam frames sent to Gemini at 1fps
- **Screen share button**: Can share screen within the call
- **End call button**: Stops webcam and closes overlay
- **Beatrice can describe what she sees** via the vision pipeline

### 6.8 — Tools Overlay
- **Grid of all registered tools** with icon, name, and description
- **Toggle switches** to enable/disable individual tools
- **Dynamic**: Tool list changes based on active template (personal-assistant / customer-support / navigation-system)

### 6.9 — Workspace Overlay
- **Auto-opens** when Beatrice creates a document artifact
- **Renders**: Markdown previews, HTML iframes, JSON data
- **Artifact types**: markdown, html, json, chart specs

### 6.10 — Google Drive Picker Overlay
- **File list** with Drive icons (Docs, Sheets, Slides, PDF)
- **Click to select** a file for conversation context

---

## 7. Voice-Activated AI Tools (Gemini Function Calling)

These are tools Beatrice can invoke autonomously during conversation. The user doesn't need to click anything — just talk.

### 7.1 — Core Utilities
| Tool | What It Does |
|------|--------------|
| `get_current_datetime` | Returns current local date, time, and timezone |
| `calculate` | Evaluates math expressions: `25 * 1.12`, `sqrt(144)`, `2**10` |
| `open_browser_url` | Opens a URL in the user's default browser |
| `execute_safe_command` | Runs safe system commands: `date`, `uptime`, `hostname`, `pwd`, `whoami`, `ls` |

### 7.2 — Document Creation
| Tool | What It Does |
|------|--------------|
| `create_markdown_document` | Creates `.md` files in the artifacts folder |
| `create_html_document` | Creates standalone `.html` files with full styling |
| `create_json_file` | Creates `.json` data files |
| `create_project_brief` | Generates structured project briefs (goal, audience, features, risks, next steps) |
| `create_checklist` | Creates interactive checklists from task lists |
| `create_readme` | Generates README.md with install steps, features, etc. |
| `create_chart_spec` | Creates chart data specs (bar, line, pie, area, scatter) |
| `create_env_template` | Creates safe `.env.example` templates without real secrets |
| `validate_json` | Validates whether a string is valid JSON |
| `extract_tasks` | Extracts action items from freeform text into a checklist |

### 7.3 — Notes
| Tool | What It Does |
|------|--------------|
| `save_note` | Saves a text note to the local notes folder |
| `read_note` | Reads a previously saved note by name |
| `list_notes` | Lists all saved notes |

### 7.4 — Memory (Long-term)
| Tool | What It Does |
|------|--------------|
| `save_memory` | **Proactively** stores important information to Supabase. Beatrice does this automatically when key decisions, preferences, or project details are discussed. Categorized as personal / work / project. |
| `search_memories` | Searches stored memories for relevant context |

### 7.5 — Google Workspace
| Tool | What It Does |
|------|--------------|
| `run_google_workspace_action` | Bridge to Google Apps Script. Supports: `ping`, `create_doc`, `append_sheet_row`, `read_sheet_range`, `create_calendar_event`, `create_gmail_draft`, `send_gmail_email`, `create_drive_folder`, `create_deployment_report`, `log_deployment_status`, `check_health_url` |

### 7.6 — Web Search
| Tool | What It Does |
|------|--------------|
| `google_search` | Searches the web via Google Custom Search API and returns structured results |

### 7.7 — Location & Navigation
| Tool | What It Does |
|------|--------------|
| `get_user_location` | Gets GPS coordinates via browser Geolocation API |
| `search_places` | Searches for nearby places/establishments using location context |

### 7.8 — WhatsApp (via GoWA)
| Tool | What It Does |
|------|--------------|
| `send_whatsapp_message` | Sends a text message to a phone number |
| `send_whatsapp_image` | Sends an image with optional caption |
| `send_whatsapp_file` | Sends a file attachment |
| `send_whatsapp_video` | Sends a video with optional caption |
| `send_whatsapp_audio` | Sends an audio message |
| `send_whatsapp_sticker` | Sends a sticker |
| `send_whatsapp_contact` | Sends a contact card |
| `send_whatsapp_location` | Sends a location pin |
| `send_whatsapp_poll` | Creates and sends a poll |
| `send_whatsapp_link` | Sends a link preview |
| `get_whatsapp_chats` | Lists all chats |
| `get_whatsapp_chat_messages` | Fetches messages from a specific chat |
| `get_whatsapp_contacts` | Lists all contacts |
| `get_whatsapp_groups` | Lists all groups |
| `create_whatsapp_group` | Creates a new group |
| `whatsapp_group_participants` | Add/remove/promote/demote group members |
| `delete_whatsapp_message` | Deletes a message |
| `react_to_whatsapp_message` | Adds an emoji reaction to a message |
| `star_whatsapp_message` | Stars/unstars a message |
| `read_whatsapp_message` | Marks a message as read |

### 7.9 — Video & Content Planning
| Tool | What It Does |
|------|--------------|
| `create_video_storyboard` | Creates structured storyboards with scenes, timing, and audience |
| `create_video_script_document` | Writes video scripts for Google Vids, YouTube, tutorials, WhatsApp, or training |
| `create_deployment_video_plan` | Plans deployment walkthrough videos with steps and risk assessment |
| `register_google_video_asset` | Registers Google Vids or Drive videos as known project assets |
| `register_google_site_asset` | Registers Google Sites as project assets |
| `create_site_content_plan` | Creates page-by-page content plans for Google Sites |
| `create_deployment_portal_copy` | Writes copy for deployment portal pages |
| `create_restaurant_demo_site_copy` | Creates restaurant website copy with Beatrice as voice/WhatsApp assistant |

### 7.10 — Blog Generation
| Tool | What It Does |
|------|--------------|
| `generate_blog_post` | Generates blog posts and saves them to Firebase Realtime Database. Auto-triggered in **Idle Blog Mode** when Beatrice has no active conversation. |

---

## 8. Beatrice Persona & Behavioral Capabilities

Beyond tools and icons, Beatrice has these core behavioral capabilities:

### 8.1 — Voice & Audio
| Capability | Description |
|------------|-------------|
| **Real-time voice conversation** | Bidirectional audio streaming at 16kHz PCM via WebSocket to Gemini Multimodal Live API |
| **33+ voice options** | Kore (default), Aoede, Charon, Fenrir, Puck, Zephyr, Luna, Nova, Leda, Orus, and 23 more |
| **100+ language support** | English, Filipino, Dutch (Flemish), French, German, Spanish, Mandarin, Japanese, Korean, Arabic, etc. |
| **Audio ducking** | Background music auto-lowers from 15% → 5% when mic is live to prevent AI hearing interference |
| **Echo cancellation** | Hardware-level via shared AudioContext between mic input and speaker output |
| **Volume-reactive UI** | Mic button pulses with real-time volume visualization |
| **Humming & singing** | Beatrice can naturally hum melodies or sing short songs when the mood fits |

### 8.2 — Vision
| Capability | Description |
|------------|-------------|
| **Webcam vision** | Live video frames sent to Gemini at 1fps as JPEG base64. Beatrice can describe what she sees. |
| **Screen share vision** | Same pipeline for screen content. Beatrice can read and analyze on-screen content in real-time. |
| **Image upload** | Attach images via paperclip. Beatrice analyzes and describes uploaded images. |
| **Barcode/QR scanning** | Camera-based scanning with automatic product identification and multilingual voice translation. |

### 8.3 — Memory & Context
| Capability | Description |
|------------|-------------|
| **Proactive memory** | Beatrice automatically saves key decisions, preferences, and project details without being asked |
| **Memory categories** | Personal, Work, Project — each with different retention context |
| **Session continuity** | Conversation history saved to Supabase. Beatrice references prior topics naturally. |
| **20-minute sessions** | Auto-warns at 19 min, says goodbye at 19:50. User can reconnect immediately. |

### 8.4 — Personality
| Trait | Description |
|-------|-------------|
| **Warm & present** | Feels like a trusted coworker-friend already in the conversation |
| **Never "offers help"** | Never opens with "How can I help?" — always continues from the existing thread |
| **Emotionally intelligent** | Mirrors the user's tone, pitch, and energy. Shows genuine curiosity, mild amusement, or subtle annoyance. |
| **Multilingual matching** | Automatically matches the user's language and code-switching patterns |
| **Eco-conscious undertone** | Subtle environmental awareness that surfaces naturally, never preachy |
| **Eburon/Master E context** | Speaks with familiarity about the Eburon AI project and its founder Jo Lernout |
| **Safety-first** | Refuses harmful requests warmly and redirects naturally. Never lectures. |
| **Dry humor & wit** | Infuses intelligence with timing, irony, and clever observations |

### 8.5 — Artifact Generation
| Type | Description |
|------|-------------|
| **HTML documents** | Interactive contracts, invoices, proposals, dashboards, forms, signature pads — all rendered in an iframe overlay |
| **Markdown documents** | Project briefs, READMEs, checklists, meeting notes |
| **JSON files** | Data exports, chart specifications, configuration templates |
| **Chart specs** | Bar, line, pie, area, scatter chart data structures |

---

## Quick Reference: Icon → Overlay Mapping

| Icon | Opens Overlay? | Overlay Name |
|------|---------------|--------------|
| Profile | ✅ | `overlay-profile` |
| Settings | ✅ | `overlay-settings` |
| Tools | ✅ | `overlay-tools` |
| History | ✅ | `overlay-history` |
| WhatsApp | ✅ | `overlay-whatsapp` |
| Scanner | ✅ | `overlay-scanner` |
| Meet | ✅ | `overlay-meet` (videocall) |
| Location | ✅ | `overlay-map` |
| Picker | ✅ | `overlay-picker` |
| *All others* | ❌ | Sends voice prompt to Beatrice |

---

## Quick Reference: Icon → Voice Prompt Mapping

| Icon | Prompt Sent to Beatrice |
|------|------------------------|
| Tasks | "Pull up my Google Tasks and give me a quick overview of what's on my list." |
| Calendar | "What's on my calendar today? Show me my schedule." |
| Drive | "Find my recent files in Google Drive and show me what's there." |
| Google | "Search the web for the latest AI and tech news..." |
| Sign | "I need a signature pad tool where I can draw my signature on screen." |
| Company | "Ask me which company I want to look up first..." |
| Chat | "Show me my Google Chat spaces and summarize what's been going on in them." |
| Forms | "Create a feedback form that's interactive with validation and a nice design." |
| Keep | "Pull up my Google Keep notes and show me what I've saved." |
| Proposal | "I need a business proposal with sections for scope, timeline, and pricing..." |
| Gmail | "Check my unread emails and summarize what's new in my inbox." |
| Sheets | "Create a new Google Sheet for tracking expenses..." |
| Slides | "Build me a presentation template with a few slides..." |
| Contract | "I need a formal contract agreement with an e-signature feature..." |
| Invoice | "I need an invoice with line items, auto-calculated totals..." |
| Contacts | "Show me my Google Contacts and help me find someone." |
| Firebase | "Create a Firebase-style dashboard with live data cards..." |
| Docs | "Ask me what type of document I need and which company it's for..." |
