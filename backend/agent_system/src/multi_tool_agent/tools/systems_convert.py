import json
from typing import Dict, Any, Optional

def systems_convert(data: Dict[str, Any], unit_system: str) -> str:
    """
    Convert weather data to the specified unit system.
    
    Args:
        data: Dictionary containing weather data with temperature, wind_speed, etc.
        unit_system: The target unit system ("US", "METRIC", "UK")
    
    Returns:
        JSON string with converted weather data
    """
    try:
        # Validate unit system
        valid_systems = ["US", "METRIC", "UK"]
        if unit_system not in valid_systems:
            return json.dumps({"error": f"Invalid unit system. Must be one of: {', '.join(valid_systems)}"})
        
        # Create a copy of the data to avoid modifying the original
        converted_data = data.copy()
        
        # Temperature conversions
        if "temperature" in converted_data and converted_data["temperature"] is not None:
            temp = float(converted_data["temperature"])
            if unit_system == "US":
                # Convert Celsius to Fahrenheit
                converted_data["temperature"] = round((temp * (9/5) + 32) * 100) / 100
                converted_data["temperature_unit"] = "°F"
            else:  # METRIC or UK
                converted_data["temperature_unit"] = "°C"
        
        # Wind speed conversions
        if "wind_speed" in converted_data and converted_data["wind_speed"] is not None:
            wind_speed = float(converted_data["wind_speed"])
            if unit_system == "US" or unit_system == "UK":
                # Convert km/h to mph
                converted_data["wind_speed"] = round((wind_speed / 1.609) * 100) / 100
                converted_data["wind_speed_unit"] = "mph"
            else:  # METRIC
                converted_data["wind_speed_unit"] = "km/h"
        
        # Add unit system info
        converted_data["unit_system"] = unit_system
        
        return json.dumps(converted_data, indent=2)
        
    except Exception as e:
        return json.dumps({"error": f"Error converting units: {str(e)}"})

def convert_visual_crossing_data(data: Dict[str, Any], unit_system: str) -> str:
    """
    Convert Visual Crossing API weather data to the specified unit system.
    
    Args:
        data: Dictionary containing Visual Crossing API weather data
        unit_system: The target unit system ("US", "METRIC", "UK")
    
    Returns:
        JSON string with converted weather data
    """
    try:
        # Validate unit system
        valid_systems = ["US", "METRIC", "UK"]
        if unit_system not in valid_systems:
            return json.dumps({"error": f"Invalid unit system. Must be one of: {', '.join(valid_systems)}"})
        
        # Create a copy of the data to avoid modifying the original
        converted_data = data.copy()
        
        # Convert days array
        if "days" in converted_data and isinstance(converted_data["days"], list):
            for day in converted_data["days"]:
                # Convert temperature fields
                for temp_field in ["temp", "tempmax", "tempmin", "feelslike", "feelslikemax", "feelslikemin"]:
                    if temp_field in day and day[temp_field] is not None:
                        temp = float(day[temp_field])
                        if unit_system == "US":
                            day[temp_field] = round((temp * (9/5) + 32) * 100) / 100
                
                # Convert wind speed
                if "windspeed" in day and day["windspeed"] is not None:
                    wind_speed = float(day["windspeed"])
                    if unit_system == "US" or unit_system == "UK":
                        day["windspeed"] = round((wind_speed / 1.609) * 100) / 100
                
                # Convert hours array within each day
                if "hours" in day and isinstance(day["hours"], list):
                    for hour in day["hours"]:
                        # Convert temperature fields in hours
                        for temp_field in ["temp", "feelslike"]:
                            if temp_field in hour and hour[temp_field] is not None:
                                temp = float(hour[temp_field])
                                if unit_system == "US":
                                    hour[temp_field] = round((temp * (9/5) + 32) * 100) / 100
                        
                        # Convert wind speed in hours
                        if "windspeed" in hour and hour["windspeed"] is not None:
                            wind_speed = float(hour["windspeed"])
                            if unit_system == "US" or unit_system == "UK":
                                hour["windspeed"] = round((wind_speed / 1.609) * 100) / 100
        
        # Add unit system info
        converted_data["unit_system"] = unit_system
        
        return json.dumps(converted_data, indent=2)
        
    except Exception as e:
        return json.dumps({"error": f"Error converting Visual Crossing data: {str(e)}"})

def convert_weather_data(data: str, unit_system: str) -> str:
    """
    Convert weather data JSON string to the specified unit system.
    
    Args:
        data: JSON string containing weather data
        unit_system: The target unit system ("US", "METRIC", "UK")
    
    Returns:
        JSON string with converted weather data
    """
    try:
        # Parse the input data
        weather_data = json.loads(data)
        
        # Check if this is Visual Crossing API data (has 'days' array)
        if isinstance(weather_data, dict) and "days" in weather_data:
            return convert_visual_crossing_data(weather_data, unit_system)
        
        # Handle both single weather data and arrays
        if isinstance(weather_data, list):
            # Convert each item in the array
            converted_array = []
            for item in weather_data:
                converted_item = json.loads(systems_convert(item, unit_system))
                if "error" not in converted_item:
                    converted_array.append(converted_item)
            
            return json.dumps(converted_array, indent=2)
        else:
            # Convert single weather data
            return systems_convert(weather_data, unit_system)
            
    except json.JSONDecodeError:
        return json.dumps({"error": "Invalid JSON data provided"})
    except Exception as e:
        return json.dumps({"error": f"Error processing weather data: {str(e)}"}) 