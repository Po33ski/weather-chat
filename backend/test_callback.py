#!/usr/bin/env python3
"""
Test script for the WeatherResponseCallback
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'agent_system', 'src'))

from multi_tool_agent.callbacks import WeatherResponseCallback

def test_callback():
    """Test the WeatherResponseCallback functionality"""
    print("🧪 Testing WeatherResponseCallback...")
    
    callback = WeatherResponseCallback()
    
    # Test current weather response
    current_weather_text = """
    Current weather in London:
    Temperature: 18°C
    Humidity: 65%
    Wind: 12 km/h
    Conditions: Partly cloudy
    """
    
    print("\n📝 Testing current weather formatting...")
    formatted = callback._format_current_weather(current_weather_text)
    print(f"Formatted response: {formatted[:200]}...")
    
    # Test forecast weather response
    forecast_text = """
    Weather forecast for Paris:
    Monday: 22°C, sunny
    Tuesday: 19°C, cloudy
    Wednesday: 21°C, partly cloudy
    """
    
    print("\n📝 Testing forecast weather formatting...")
    formatted = callback._format_forecast_weather(forecast_text)
    print(f"Formatted response: {formatted[:200]}...")
    
    # Test history weather response
    history_text = """
    Historical weather for Berlin:
    Last week was mostly sunny with temperatures around 20°C
    """
    
    print("\n📝 Testing history weather formatting...")
    formatted = callback._format_history_weather(history_text)
    print(f"Formatted response: {formatted[:200]}...")
    
    print("\n✅ Callback test completed!")

if __name__ == "__main__":
    test_callback() 