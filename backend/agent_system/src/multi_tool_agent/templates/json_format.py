json_format_instructions = """
    OUTPUT RULES (STRICT):
    - Return ONE message composed of:
      1) Short human text (1–3 sentences).
      2) A single blank line.
      3) ONE fenced JSON block labeled weather-json that contains ONLY JSON.
    - No extra code blocks, no extra text below the fence.
    - The UI parses the short text (above) and the JSON (inside the fenced block).
    - The JSON must follow one of the schemas below.
"""

json_format = """
CURRENT (when user asks for current weather)
{
  "meta": {
    "city": "<city name>",
    "kind": "current",
    "date": "YYYY-MM-DD",
    "date_range": null,
    "language": "<lang>",
    "unit_system": "US|METRIC|UK"
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

FORECAST (if user asks for forecast; 15 days max unless specified)
{
  "meta": {
    "city": "<city name>",
    "kind": "forecast",
    "date": null,
    "date_range": "YYYY-MM-DD..YYYY-MM-DD",
    "language": "<lang>",
    "unit_system": "US|METRIC|UK"
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
    "language": "<lang>",
    "unit_system": "US|METRIC|UK"
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
"""