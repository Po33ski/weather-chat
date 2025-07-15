import json

def convert_weather_data(value, what_is_it: str, unit_system: str):
    """
    Convert a single weather value to the specified unit system.

    Args:
        value: The value to convert (float or int).
        what_is_it: What the value represents ("temperature" or "wind_speed").
        unit_system: The target unit system ("US", "METRIC", "UK").

    Returns:
        Tuple of (converted_value, unit)
    """
    try:
        if what_is_it == "temperature":
            if unit_system == "US":
                # Celsius to Fahrenheit
                return round((float(value) * 9/5) + 32, 2), "°F"
            else:
                return float(value), "°C"
        elif what_is_it == "wind_speed":
            if unit_system in ["US", "UK"]:
                # km/h to mph
                return round(float(value) / 1.609, 2), "mph"
            else:
                return float(value), "km/h"
        else:
            return value, ""
    except Exception as e:
        return None, f"Error: {str(e)}" 

        