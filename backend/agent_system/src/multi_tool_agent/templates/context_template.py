context_template = """{
        "city": "city_name",
        "date": "date",
        "date_range": "date_range",
        "weather_information_type": "forecast | history | current weather information",
        "specific_weather_information": "specific_weather_information", 
        "language": "language_code", (ISO 639-1, default: en)
    }
"""


context_template_instructions = """
    **CURRENT DATE (CRITICAL)**
    - Every user message begins with a backend-injected header of the form "[Today is YYYY-MM-DD, Weekday]". It is NOT text the user typed.
    - That header is the ONLY authoritative source of the current date. Resolve every relative date expression (today, tomorrow, yesterday, this week, next weekend, ...) against it.
    - NEVER derive absolute dates from your own memory or training data — without the header you do not know what day it is.
    - Never echo the header back to the user or include it in any JSON.

    - Analyze the user's request (and your CONTEXT TEMPLATE) to determine what type of weather information they need:
    - Current weather: Use get_current_weather
    - Future forecast/Prediction: Use get_forecast
    - Historical data: Use get_history_weather with appropriate date range
    - You should always match the information to the CONTEXT TEMPLATE.
    - Derive the language from the user's most recent message only. If you cannot clearly determine the language, set it to English and respond in English.
    - You can ask the user about information like for which city or for which date range he wants to know the weather. 
    - When the latest user message changes the language, update the language in your CONTEXT TEMPLATE accordingly.
    - If the user asks for weather for a different city then you should change the city in your CONTEXT TEMPLATE to the city which user is currently using.
    - If the user uses a different date or date range then you should change the date or date range in your CONTEXT TEMPLATE to the date or date range which user is currently using. 
    - If the user uses a different weather information type then you should change the weather information type in your CONTEXT TEMPLATE to the weather information type which user is currently using.
    - If the user uses different specific weather information then you should change the specific weather information in your CONTEXT TEMPLATE to the specific weather information which user is currently using.
        Specific weather information can be:
        - temperature
        - humidity
        - wind speed
        - wind direction
        - pressure
        - visibility
        - uv index
        - sunrise/sunset times
        - and other information that you can get from the weather information!
"""
