import json
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

class WeatherResponseCallback:
    """
    Callback to validate and format weather agent responses to match the expected models.
    This ensures the response fits one of the templates: CurrentWeatherResponse, 
    ForecastWeatherResponse, or HistoryWeatherResponse with additional description fields.
    """
    
    def __init__(self):
        self.current_weather_pattern = r'current.*weather|today.*weather|now.*weather'
        self.forecast_pattern = r'forecast|future|tomorrow|next.*day|next.*week'
        self.history_pattern = r'history|past|yesterday|last.*day|last.*week'
        self.hourly_pattern = r'hour|hourly|every.*hour'
    
    def after_agent(self, response):
        """
        Process the agent response and format it according to weather data models.
        """
        try:
            # Get the text content from the response
            if not hasattr(response, 'content') or not response.content:
                return response
            
            # Try to get text from different possible response structures
            text_content = None
            if hasattr(response.content, 'parts') and response.content.parts and not isinstance(response.content, str):
                text_content = response.content.parts[0].text
            elif hasattr(response.content, 'text') and not isinstance(response.content, str):
                text_content = response.content.text
            elif isinstance(response.content, str):
                text_content = response.content
            
            if not text_content:
                return response
            
            # Check if this is a weather-related response
            if not self._is_weather_response(text_content):
                return response
            
            # Parse and format the response
            formatted_response = self._format_weather_response(text_content)
            
            # Create new response with formatted content
            if hasattr(response.content, 'parts') and response.content.parts and not isinstance(response.content, str):
                response.content.parts[0].text = formatted_response
            elif hasattr(response.content, 'text') and not isinstance(response.content, str):
                response.content.text = formatted_response
            # For string content, we can't modify it directly, so we skip modification
            
            return response
            
        except Exception as e:
            print(f"Error in WeatherResponseCallback: {e}")
            return response
    
    def _is_weather_response(self, text: str) -> bool:
        """Check if the response contains weather-related content."""
        weather_keywords = [
            'weather', 'temperature', 'forecast', 'current', 'history',
            'humidity', 'wind', 'pressure', 'conditions', 'sunrise', 'sunset'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in weather_keywords)
    
    def _format_weather_response(self, text: str) -> str:
        """Format the weather response according to the appropriate template."""
        text_lower = text.lower()
        
        # Determine the type of weather response
        if re.search(self.current_weather_pattern, text_lower):
            return self._format_current_weather(text)
        elif re.search(self.forecast_pattern, text_lower):
            return self._format_forecast_weather(text)
        elif re.search(self.history_pattern, text_lower):
            return self._format_history_weather(text)
        else:
            # Default to current weather if we can't determine
            return self._format_current_weather(text)
    
    def _format_current_weather(self, text: str) -> str:
        """Format current weather response with description."""
        try:
            # Extract weather data from the text
            weather_data = self._extract_weather_data(text)
            
            # Create a simple current weather response
            response = {
                "type": "current_weather",
                "success": True,
                "data": {
                    "location": weather_data.get("location", "Unknown"),
                    "temperature": weather_data.get("temperature", 0.0),
                    "humidity": weather_data.get("humidity"),
                    "wind_speed": weather_data.get("wind_speed"),
                    "wind_direction": weather_data.get("wind_direction"),
                    "pressure": weather_data.get("pressure"),
                    "visibility": weather_data.get("visibility"),
                    "uv_index": weather_data.get("uv_index"),
                    "conditions": weather_data.get("conditions"),
                    "icon": weather_data.get("icon"),
                    "sunrise": weather_data.get("sunrise"),
                    "sunset": weather_data.get("sunset"),
                    "timestamp": datetime.now().isoformat(),
                    "weather_type": "current"
                },
                "description": self._extract_description(text),
                "show_table": False  # Current weather doesn't need a table
            }
            
            return json.dumps(response, indent=2)
            
        except Exception as e:
            print(f"Error formatting current weather: {e}")
            return text
    
    def _format_forecast_weather(self, text: str) -> str:
        """Format forecast weather response with description and table data."""
        try:
            # Extract weather data from the text
            weather_data = self._extract_weather_data(text)
            days_data = self._extract_days_data(text)
            
            response = {
                "type": "forecast_weather",
                "success": True,
                "data": days_data,
                "description": self._extract_description(text),
                "show_table": True,  # Forecast should show table
                "location": weather_data.get("location", "Unknown"),
                "period": "forecast"
            }
            
            return json.dumps(response, indent=2)
            
        except Exception as e:
            print(f"Error formatting forecast weather: {e}")
            return text
    
    def _format_history_weather(self, text: str) -> str:
        """Format history weather response with description and table data."""
        try:
            # Extract weather data from the text
            weather_data = self._extract_weather_data(text)
            days_data = self._extract_days_data(text)
            
            response = {
                "type": "history_weather",
                "success": True,
                "data": days_data,
                "description": self._extract_description(text),
                "show_table": True,  # History should show table
                "location": weather_data.get("location", "Unknown"),
                "period": "history"
            }
            
            return json.dumps(response, indent=2)
            
        except Exception as e:
            print(f"Error formatting history weather: {e}")
            return text
    
    def _extract_weather_data(self, text: str) -> Dict[str, Any]:
        """Extract weather data from text using regex patterns."""
        data = {}
        
        # Extract location
        location_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text)
        if location_match:
            data["location"] = location_match.group(1)
        
        # Extract temperature
        temp_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:°C|°F|degrees?)', text)
        if temp_match:
            data["temperature"] = float(temp_match.group(1))
        
        # Extract humidity
        humidity_match = re.search(r'humidity[:\s]*(\d+)%?', text, re.IGNORECASE)
        if humidity_match:
            data["humidity"] = float(humidity_match.group(1))
        
        # Extract wind speed
        wind_speed_match = re.search(r'wind[:\s]*(\d+(?:\.\d+)?)\s*(?:km/h|mph)', text, re.IGNORECASE)
        if wind_speed_match:
            data["wind_speed"] = float(wind_speed_match.group(1))
        
        # Extract conditions
        conditions_match = re.search(r'(sunny|cloudy|rainy|snowy|partly cloudy|clear)', text, re.IGNORECASE)
        if conditions_match:
            data["conditions"] = conditions_match.group(1)
        
        return data
    
    def _extract_days_data(self, text: str) -> List[Dict[str, Any]]:
        """Extract multiple days of weather data from text."""
        days_data = []
        
        # Look for patterns that indicate multiple days
        day_patterns = re.findall(r'(\w+)\s*:\s*(\d+(?:\.\d+)?)\s*(?:°C|°F)', text)
        
        for i, (day, temp) in enumerate(day_patterns[:15]):  # Limit to 15 days
            day_data = {
                "description": f"Weather for {day}",
                "datetime": f"Day {i+1}",
                "temp": float(temp),
                "tempmax": float(temp) + 2,  # Estimate
                "tempmin": float(temp) - 2,   # Estimate
                "winddir": "N/A",
                "windspeed": 0.0,
                "conditions": "Unknown",
                "sunrise": "N/A",
                "sunset": "N/A",
                "pressure": None,
                "humidity": None
            }
            days_data.append(day_data)
        
        return days_data
    
    def _extract_description(self, text: str) -> str:
        """Extract a description from the weather text."""
        # Try to find a summary or description in the text
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and len(line) > 20 and not line.startswith('{') and not line.startswith('['):
                return line[:200] + "..." if len(line) > 200 else line
        
        # Fallback description
        return "Weather information provided by the weather assistant." 