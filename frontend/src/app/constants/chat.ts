// Mirrors the backend ChatRequest limit (api/models.py) so oversized messages
// are stopped in the UI instead of coming back as a 422.
export const MAX_MESSAGE_LENGTH = 4000;

// Show the character counter once the message gets close to the limit.
export const MESSAGE_COUNTER_THRESHOLD = 3500;

// The backend gives the ADK runner 100 s; leave headroom for the proxy hop.
export const CHAT_REQUEST_TIMEOUT_MS = 120_000;

// Visual Crossing forecasts (and the agent prompt) cover today + 14 days.
export const FORECAST_HORIZON_DAYS = 14;
export const MAX_RANGE_DAYS = 15;
export const MAX_STAY_NIGHTS = 30;
export const MAX_DESTINATION_LENGTH = 80;
