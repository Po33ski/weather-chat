json_format_instructions = """
    - You MUST return everything in ONE message/string in the following order:
      a) Short human text (1–4 sentences) which includes weather conditions plus it may include other interesting information about the weather if you can not put it in the JSON. No lists/bullets. 
        - If you send more info in JSON then you should finish human text with smth like "you find more info below:".
        - If user ask for some particlaur information (like in your CONTEXT TEMPLATE specific_weather_information), then you should only send the short information to the user as a human text and not in the JSON.
      b) A blank line.
      c) Exactly ONE fenced JSON block labeled weather-json see your JSON FORMAT section.
    - Do NOT put any other text below or above the fenced block besides the short text.
    - Do NOT add extra fences or code blocks. Only one weather-json block.
    - The UI will parse the human text as the part before the fenced block, and the JSON from inside the fenced block.
    - Example output:
    ```
    Found the requested weather information.
    ```
    ```weather-json
    {json_format}
    ```
"""

json_format = """ a) CURRENT WEATHER TEMPLATE
    ```weather-json
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
        "conditions": "Lekki deszcz"
      }
    }
    ```

    b) FORECAST TEMPLATE (15 days max unless user asked otherwise)
    ```weather-json
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
          "conditions": "Pochmurno",
          "sunrise": "06:10",
          "sunset": "19:20",
          "pressure": 1014,
          "humidity": 68
        }
      ]
    }
    ```

    c) HISTORY TEMPLATE (date range required)
    ```weather-json
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
          "conditions": "Przelotne opady",
          "sunrise": "06:05",
          "sunset": "19:25",
          "pressure": 1018,
          "humidity": 70
        }
      ]
    }
    ```
"""