json_format_instructions = """
    OUTPUT RULES (STRICT):
    - Return ONE message composed of:
      1) Human text (1–3 sentences if user ask only for weather information or longer text if user ask for travel advice, trip ideas, what to do/visit in a city given the weather).
      2) A single blank line.
      3) ONE fenced JSON block labeled weather-json (for weather/travel data), hotel-json (for hotel search results), or combined-json (ONLY for combined weather+hotels requests, see COMBINED schema) that contains ONLY JSON.
    - No extra code blocks, no extra text below the fence.
    - The UI parses the short text (above) and the JSON (inside the fenced block).
    - The JSON must follow one of the schemas below.
    - Set meta.language to the language you used in the short text. If you are unsure which language to use, respond in English and set meta.language to "en".

    JSON VALIDITY (STRICT — a parser will reject anything that breaks these):
    - Output MUST be strictly valid JSON: no trailing commas after the last item in an object or array, no comments, no unquoted keys, no single quotes.
    - Every string value must be a properly quoted and escaped JSON string (escape internal quotes as \\" and newlines as \\n) — never leave a value empty/unquoted; use "" for an unknown string.
    - Every object and array you open must be closed. Before emitting the closing ``` of the fence, double-check that all braces/brackets are balanced.
    - Never truncate the JSON to save space — if a list (e.g. forecast days) is long, still write every item in full with correct closing brackets rather than cutting it short.
"""

json_format = """
CURRENT (when user asks for current weather)
{
  "meta": {
    "city": "<city name>",
    "kind": "current",
    "date": "YYYY-MM-DD",
    "date_range": null,
    "language": "<lang>"
  },
  "current": {
    "temp": 18,
    "tempmax": 19,
    "tempmin": 12,
    "windspeed": 22,
    "winddir": 180,
    "pressure": 1016,
    "humidity": 65,
    "sunrise": "06:12",
    "sunset": "19:18",
    "conditions": "Light rain"
  }
}

FORECAST (if user asks for forecast; output up to the next 15 days)
{
  "meta": {
    "city": "<city name>",
    "kind": "forecast",
    "date": null,
    "date_range": "YYYY-MM-DD..YYYY-MM-DD",
    "language": "<lang>"
  },
  "days": [
    {
      "datetime": "2025-08-04",
      "temp": 18,
      "tempmax": 21,
      "tempmin": 14,
      "winddir": 200,
      "windspeed": 18,
      "conditions": "Cloudy",
      "sunrise": "06:10",
      "sunset": "19:20",
      "pressure": 1014,
      "humidity": 68
    }
  ]
}

HISTORY (if user asks for historical data; date_range required)
{
  "meta": {
    "city": "<city name>",
    "kind": "history",
    "date": null,
    "date_range": "YYYY-MM-DD..YYYY-MM-DD",
    "language": "<lang>"
  },
  "days": [
    {
      "datetime": "2025-08-01",
      "temp": 17,
      "tempmax": 19,
      "tempmin": 13,
      "winddir": 160,
      "windspeed": 12,
      "conditions": "Showers",
      "sunrise": "06:05",
      "sunset": "19:25",
      "pressure": 1018,
      "humidity": 70
    }
  ]
}

TRAVEL ADVICE replies contain NO fenced JSON at all — only plain human text
with the three recommendations. There is no "travel_advice" JSON kind; the
backend parser rejects it.

HOTELS (when user asks to search or find hotels in a city) — uses hotel-json fence, NOT weather-json
```hotel-json
{
  "meta": {
    "city": "<city name>",
    "kind": "hotels",
    "date": null,
    "date_range": "<check_in YYYY-MM-DD>..<check_out YYYY-MM-DD> or null if no dates given",
    "language": "<lang>"
  },
  "hotels": [
    {
      "name": "<hotel name>",
      "price_per_night": "<numeric value as string, e.g. '120', or empty string if unknown>",
      "currency": "<'PLN' if language is Polish, otherwise 'USD' — or empty string if no price in that currency was found>",
      "availability": "available | unknown",
      "rating": <float 0-10 or null>,
      "reviews_count": <integer or null>,
      "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
      "url": "<booking page url or empty string>"
    }
  ]
}
```
- The hotels array must contain between 0 and 3 hotel objects. 0 is valid and expected when no real hotel could be identified — return "hotels": [] in that case rather than inventing a placeholder entry; say so in the human text instead.
- Use the hotel-json fence label (not weather-json) for hotel responses.
- The frontend detects the hotel-json fence and renders a dedicated hotel card view.

COMBINED (ONLY when a single user turn asks for both weather/what-to-do AND hotels for the same city — see COMBINED QUERY LOGIC) — uses combined-json fence, NOT weather-json or hotel-json
```combined-json
{
  "meta": {
    "city": "<city name>",
    "kind": "combined",
    "date": "YYYY-MM-DD or null",
    "date_range": "<YYYY-MM-DD..YYYY-MM-DD> or null",
    "language": "<lang>"
  },
  "weather": {
    "kind": "current" | "forecast" | "history",
    "current": { ...same shape as CURRENT.current, present only if weather.kind is "current"... },
    "days": [ ...same shape as FORECAST/HISTORY.days, present only if weather.kind is "forecast" or "history"... ]
  },
  "hotels": [
    { ...same shape as one HOTELS.hotels entry... }
  ]
}
```
- weather.kind determines whether "current" or "days" is present — never include both.
- The hotels array must contain between 0 and 3 hotel objects. 0 is valid and expected when no real hotel could be identified — return "hotels": [] in that case rather than inventing a placeholder entry; say so in the human text instead.
- There is no "travel_advice" key here — the "what to do" suggestions are written as plain prose in the human text above the fence, exactly like a normal travel-advice reply, not as JSON.
- Use the combined-json fence label only for combined requests; use weather-json or hotel-json for single-intent requests as usual.
"""
