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