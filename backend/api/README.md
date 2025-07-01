# FastAPI Backend for Weather Center Chat

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

- The API will be available at `http://localhost:8000` by default.
- The `/health` endpoint can be used for health checks.
- The `/api/chat` endpoint is used by the frontend chat view.

## Notes
- The backend loads the `GOOGLE_API_KEY` securely from the `.env` file located in the `multi_tool_agent` directory (see `utils/load_env_data.py`).
- The API does **not** expose the API key to the frontend or clients.
- The `/api/chat` endpoint is currently a prototype and will later be connected to the agent system. 