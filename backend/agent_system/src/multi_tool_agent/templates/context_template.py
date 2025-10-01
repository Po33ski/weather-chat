context_template = """{
        "city": "city_name",
        "date": "date",
        "date_range": "date_range",
        "weather_information_type": "forecast | history | current weather information",
        "specific_weather_information": "specific_weather_information", 
        "language": "language_name", (default: english)
    }
"""


context_template_instructions = """
    - Analyze the user's request (and your CONTEXT TEMPLATE) to determine what type of weather information they need:
    - Current weather: Use get_current_weather
    - Future forecast/Prediction: Use get_forecast
    - Historical data: Use get_history_weather with appropriate date range
    - You should always match the information to the CONTEXT TEMPLATE.
    - You should always use the language which user is currently using.
    - You can ask the user about information like for which city or for which date range he wants to know the weather. 
    - If you recognize that user use different language then you should change the language in your CONTEXT TEMPLATE to the language which user is currently using.
    - If you recognize that user asked for a weather for a different city then you should change the city in your CONTEXT TEMPLATE to the city which user is currently using.
    - If you recognize that user use different date or date range then you should change the date or date range in your CONTEXT TEMPLATE to the date or date range which user is currently using. 
    - If you recognize that user use different weather information type then you should change the weather information type in your CONTEXT TEMPLATE to the weather information type which user is currently using.
    - If you recognize that user use different specific weather information then you should change the specific weather information in your CONTEXT TEMPLATE to the specific weather information which user is currently using.
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