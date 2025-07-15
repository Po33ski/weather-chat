import json
from typing import Optional

def convert_weather_data(
    value: float,
    what_is_it: str,
    unit_system: Optional[str] = None,
    tool_context=None
) -> str:
    """
    Convert a single weather value to the specified unit system.

    Args:
        value: The value to convert (float or int).
        what_is_it: What the value represents ("temperature" or "wind_speed").
        unit_system: The target unit system ("US", "METRIC", "UK"). If not provided, will use session state.
        tool_context: (optional) The tool context, used to access session state.

    Returns:
        JSON string with {"value": converted_value, "unit": unit}
    """
    try:
        # If unit_system is not provided, try to get it from tool_context
        if not unit_system and tool_context and hasattr(tool_context, "state"):
            unit_system = tool_context.state.get("unit_system", "METRIC")
        if not unit_system:
            unit_system = "METRIC"
        if what_is_it == "temperature":
            if unit_system == "US":
                return json.dumps({"value": round((float(value) * 9/5) + 32, 2), "unit": "°F"})
            else:
                return json.dumps({"value": float(value), "unit": "°C"})
        elif what_is_it == "wind_speed":
            if unit_system in ["US", "UK"]:
                return json.dumps({"value": round(float(value) / 1.609, 2), "unit": "mph"})
            else:
                return json.dumps({"value": float(value), "unit": "km/h"})
        else:
            return json.dumps({"value": value, "unit": ""})
    except Exception as e:
        return json.dumps({"error": f"Error: {str(e)}"}) 

        