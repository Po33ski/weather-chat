json_format_instructions = """
    OUTPUT RULES (STRICT):
    - Return ONE message composed of:
      1) Human text (1–3 sentences if user ask only for weather information or longer text if user ask for travel advice, trip ideas, what to do/visit in a city given the weather).
      2) A single blank line.
      3) ONE fenced JSON block labeled weather-json (for weather/travel data) or hotel-json (for hotel search results) that contains ONLY JSON.
    - No extra code blocks, no extra text below the fence.
    - The UI parses the short text (above) and the JSON (inside the fenced block).
    - The JSON must follow one of the schemas below.
    - Set meta.language to the language you used in the short text. If you are unsure which language to use, respond in English and set meta.language to "en".
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

TRAVEL_ADVICE (if user asks for travel advice)
{
  "meta": {
    "city": "<city name>",
    "kind": "travel_advice",
    "date": null,
    "date_range": null,
    "language": "<lang>",
  },
  "travel_advice": [
    {
      "text": "<travel advice text>"
    }
  ]
}

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
- The hotels array must contain between 1 and 3 hotel objects.
- Use the hotel-json fence label (not weather-json) for hotel responses.
- The frontend detects the hotel-json fence and renders a dedicated hotel card view.
"""
