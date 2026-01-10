# Weather Center Chat

Weather Center Chat focuses on a single conversational experience: users ask for **weather insights** and **weather-aware travel advice**, and the app orchestrates Google ADK agents to produce concise human responses plus a structured `weather-json` payload that powers the chat UI.

## AI Chat Flow

- A React (Vite SPA) chat surface (`frontend/src/app/views/ChatPage.tsx`) renders the human-friendly message and consumes the structured `weather-json` block returned by the agent.
- The FastAPI backend exposes `/api/chat`, keeps lightweight per-browser sessions alive, and pipes user prompts into a Google ADK runner.
- The response travels back as one string that combines chat text and the fenced JSON block so the frontend can deterministically split it.

## Google ADK Agent Graph

```text
backend/agent_system/src/multi_tool_agent/
├── agent.py                     # root agent stitched into FastAPI
├── prompt.py                    # global instructions/shared context template
├── sub_agents/
│   ├── get_weather/
│   │   ├── agent.py             # specialist enforcing weather-json output contract
│   │   └── prompt.py
│   └── travel_advice/
│       ├── agent.py             # specialist suggesting places/activities based on weather
│       └── prompt.py
└── tools/
    ├── get_current_weather.py   # wraps backend weather service: current conditions
    ├── get_forecast.py          # wraps backend weather service: forecast
    ├── get_history_weather.py   # wraps backend weather service: historical data
    └── send_email.py            # SMTP helper (currently unused in the agent graph)
```

- The root agent loads into a `google.adk.runners.Runner`, maintains the chat context (city, date range, unit system, language), and decides when to delegate to child agents.
- The weather specialist ensures every weather reply follows the `weather-json` contract and only calls tools when the context is complete.
- The travel advice specialist reads the same context (city + current weather) and returns three short, human‑friendly suggestions (places/activities) tailored to the conditions (sun, rain, heat, cold, wind) without any JSON.
- Tool wrappers read normalized weather data from the backend service, keeping the agent grounded on deterministic values instead of free-form hallucinations.

### Example conversations

- **Pure weather:**
  - "What is the current weather in Krakow?"
  - "What will the weather be in Paris tomorrow?"
- **Weather‑aware travel advice (two‑step flow):**
  - Step 1: "What is the current weather in Lisbon?"
  - Step 2: "Given this weather, what are three things worth visiting in Lisbon?"
  - Under the hood, the root agent first calls `get_weather_agent` and then `travel_advice_agent`, which uses the current weather data for the city.

## Local Development (quick start)

Requirements: Python 3.12 with `uv`, Node.js 18+, and API keys for Google Generative AI + Visual Crossing.

```bash
# 1. Backend
cd backend
uv sync
source ../env-scratchpad.sh   # exports GOOGLE_API_KEY, VISUAL_CROSSING_API_KEY, etc.
uv run uvicorn api.main:app --reload --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
# Optional: point the frontend straight at FastAPI without Nginx
export VITE_API_URL=http://localhost:8000
npm run dev

# App will be available at:
# http://localhost:5173
```

## Docker (single container)

```bash
source env-scratchpad.sh
./deploy-production.sh
```

The script builds the multi-stage image (backend builder → frontend (Vite) builder → runtime), launches Nginx on port 80, and proxies `/api` requests to FastAPI. Use `curl http://localhost/api/health` to confirm the stack is ready.

Visit `http://localhost`, sign in, and start chatting—the assistant will stream Google ADK-backed weather answers into the single-page experience.
