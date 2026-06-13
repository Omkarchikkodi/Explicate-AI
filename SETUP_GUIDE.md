# Explicate AI — Complete Setup & Implementation Guide

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] Python 3.11 or newer (`python --version`)
- [ ] Node.js 18 or newer (`node --version`)
- [ ] npm 9+ (`npm --version`)
- [ ] An Anthropic API key from https://console.anthropic.com
- [ ] Git installed

---

## Step 1: Project Setup

```bash
# Clone or download the project
git clone https://github.com/YOUR_USERNAME/explicate-ai.git
cd explicate-ai
```

---

## Step 2: Backend Setup

### 2a. Create a Python virtual environment

```bash
cd backend

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows (cmd):
python -m venv venv
venv\Scripts\activate

# On Windows (PowerShell):
python -m venv venv
venv\Scripts\Activate.ps1
```

You should see `(venv)` in your terminal prompt.

### 2b. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs: FastAPI, Uvicorn, Anthropic SDK, httpx, BeautifulSoup4, Pydantic.

### 2c. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` in your editor and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXX
```

### 2d. Start the backend server

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**Verify it's working:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"Explicate AI"}
```

You can explore the API docs at: http://localhost:8000/docs

---

## Step 3: Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
cd frontend

# Install Node dependencies
npm install
```

### 3b. Start the frontend dev server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local:   http://localhost:5173/
```

---

## Step 4: Use the App

Open your browser and visit: **http://localhost:5173**

You should see the Explicate AI homepage with example queries. Click one or type your own and press Enter!

---

## Step 5: Production Build (Optional)

### Frontend build

```bash
cd frontend
npm run build
# Output goes to frontend/dist/
```

### Backend production

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Deploying with Docker (Optional)

Create `Dockerfile` for backend:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set" error
Make sure you copied `.env.example` to `.env` and added your key.

### CORS errors in the browser
The Vite dev server proxies `/api` requests to the backend automatically.
Make sure both servers are running (backend on :8000, frontend on :5173).

### "Module not found" errors in Python
Make sure you activated the virtual environment (`source venv/bin/activate`).

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn main:app --port 8001
# Then update vite.config.ts proxy target to :8001
```

### Search returns empty results
DuckDuckGo's API occasionally rate-limits. This is normal — Claude will note
when it can't find information rather than hallucinating.

---

## Architecture Decision Notes

### Why SSE over WebSockets?
Server-Sent Events are simpler for this unidirectional flow (server → client).
WebSockets would add unnecessary bidirectional complexity.

### Why DuckDuckGo?
No API key required, making setup frictionless. For production, swap in
Brave Search API or Serper.dev for more reliable results.

### Why Zustand over Redux?
Minimal boilerplate for this scale. The conversation store is simple enough
that Redux would be overkill.

### Why claude-opus-4-5?
The agentic loop requires strong reasoning for multi-step planning and
deciding when to stop searching. Opus delivers the best results here.
Switch to claude-sonnet for faster/cheaper responses if needed.
