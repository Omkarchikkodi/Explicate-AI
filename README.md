# Explicate AI 🔍

> **Agentic Web Research Assistant** — Ask anything. It searches, reads, and synthesizes.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![Anthropic](https://img.shields.io/badge/Powered%20by-Claude%20claude--opus--4--5-orange.svg)](https://anthropic.com)

---

## What is Explicate AI?

Explicate AI is an autonomous research agent that navigates the web on your behalf. Unlike traditional search engines that return links, Explicate **plans**, **browses**, **reads**, and **synthesizes** — delivering structured answers with cited sources, just like a brilliant research assistant sitting beside you.

Built for the **Agentic Web** hackathon theme, it demonstrates:
- **Multi-step autonomous planning** using Claude's tool-use API
- **Real-time agent transparency** via Server-Sent Events (SSE) streaming
- **Resilient web browsing** with fallback strategies
- **Production-grade architecture** ready for deployment

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Explicate AI                         │
│                                                         │
│  ┌──────────────┐     SSE Stream      ┌──────────────┐  │
│  │   React UI   │ ◄────────────────── │  FastAPI     │  │
│  │  (Vite/TS)   │ ────── Query ─────► │  Backend     │  │
│  └──────────────┘                     └──────┬───────┘  │
│                                              │          │
│                                    ┌─────────▼────────┐ │
│                                    │  Research Agent  │ │
│                                    │  (Agentic Loop)  │ │
│                                    └─────────┬────────┘ │
│                                              │          │
│                              ┌───────────────▼────────┐ │
│                              │   Claude claude-opus-4-5 API    │ │
│                              │   + Tool Use           │ │
│                              └───────────────┬────────┘ │
│                                              │          │
│                         ┌────────────────────▼───────┐  │
│                         │         Tools              │  │
│                         │  • web_search (DDG API)    │  │
│                         │  • fetch_page (httpx+BS4)  │  │
│                         │  • extract_structured_data │  │
│                         └────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Agentic Loop (How it works)

1. **User submits a query** → Backend receives it
2. **Agent calls Claude** with the query + available tools
3. **Claude plans** and decides which tools to call
4. **Tools execute** in parallel (web search, page fetch, data extraction)
5. **Results feed back** to Claude for synthesis
6. **Steps 2-5 repeat** until Claude has enough info (max 10 iterations)
7. **Final answer streams** back to the UI with sources cited

---

## Project Structure

```
explicate-ai/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variables template
│   ├── core/
│   │   └── config.py            # App configuration (Pydantic Settings)
│   ├── agents/
│   │   └── research_agent.py    # Core agentic loop with SSE streaming
│   ├── tools/
│   │   └── web_tools.py         # Tool definitions + implementations
│   └── api/
│       └── routes.py            # FastAPI routes (/query/stream, /query, /suggest)
│
└── frontend/
    ├── index.html               # HTML entry point
    ├── package.json             # Node dependencies
    ├── vite.config.ts           # Vite + proxy config
    ├── tailwind.config.js       # Tailwind with custom design system
    └── src/
        ├── main.tsx             # React entry point
        ├── App.tsx              # Root component (layout + routing)
        ├── index.css            # Global styles + prose theme
        ├── types/index.ts       # TypeScript interfaces
        ├── store/conversation.ts # Zustand state management
        ├── lib/api.ts           # SSE streaming client
        ├── hooks/useResearch.ts # Core query orchestration hook
        └── components/
            ├── SearchBar.tsx    # Query input with suggestions + keyboard nav
            ├── MessageBubble.tsx # User/assistant message rendering
            ├── ToolCallPanel.tsx # Live agent step visualization
            ├── StatusBar.tsx    # Real-time status indicator
            └── Hero.tsx         # Empty state with example queries
```

---

## Setup Instructions

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Anthropic API Key** — get one at [console.anthropic.com](https://console.anthropic.com)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/explicate-ai.git
cd explicate-ai
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY

# Start the backend
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Open the app

Visit **http://localhost:5173** and start researching!

---

## AI Integration Details

### Model
`claude-opus-4-5` — Anthropic's most capable model, chosen for complex multi-step reasoning.

### Tools
| Tool | Description | Implementation |
|------|-------------|----------------|
| `web_search` | Search the web for current information | DuckDuckGo Instant Answer API (no key needed) |
| `fetch_page` | Read full content of any URL | httpx + BeautifulSoup4, noise-filtered |
| `extract_structured_data` | Pull tables/lists from data pages | BS4 table/list parser |

### Streaming Architecture
- Backend uses **async generators** to yield agent events
- Events are serialized as **Server-Sent Events (SSE)**
- Frontend consumes with a **ReadableStream** iterator
- UI updates reactively with **Zustand** state management

---

## API Reference

### `POST /api/query/stream`
Streams the full agent research process as SSE events.

```json
// Request
{ "query": "string", "conversation_history": [] }

// Events (each line: data: {...}\n\n)
{ "type": "thinking", "content": "Planning research…" }
{ "type": "tool_call", "name": "web_search", "input": { "query": "..." } }
{ "type": "tool_result", "name": "web_search", "result": { ... } }
{ "type": "answer_chunk", "content": "partial markdown..." }
{ "type": "done", "sources": ["https://..."] }
```

### `POST /api/query`
Non-streaming version, returns final answer.

### `GET /api/suggest?q=<partial>`
Returns query suggestions.

---

## Team

| Name | Role |
|------|------|
| [Your Name] | Full-Stack Development, AI Integration |

---

## Built With

- [Anthropic Claude](https://anthropic.com) — AI backbone
- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
- [React](https://react.dev) + [TypeScript](https://typescriptlang.org) — Frontend
- [Vite](https://vitejs.dev) — Build tool
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Zustand](https://zustand-demo.pmnd.rs) — State management
- [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) — Web scraping
- [httpx](https://www.python-httpx.org) — Async HTTP client
