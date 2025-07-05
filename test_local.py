#!/usr/bin/env python3
"""
Quick test script to verify local backend functionality
"""

import requests
import json
import time

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🌤️  Testing Weather Center Chat Backend")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed")
            print(f"   Status: {data['status']}")
            print(f"   Weather Service: {data['services']['weather_service']}")
            print(f"   AI Chat: {data['services']['ai_chat']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Root endpoint
    print("\n2. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Root endpoint working")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test 3: Weather endpoint
    print("\n3. Testing weather endpoint...")
    try:
        response = requests.post(
            f"{base_url}/api/weather/current",
            json={"location": "London"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Weather endpoint working")
                print(f"   Temperature: {data['data']['temperature']}°C")
            else:
                print(f"⚠️  Weather endpoint returned error: {data['error']}")
        else:
            print(f"❌ Weather endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Weather endpoint error: {e}")
    
    # Test 4: Chat endpoint
    print("\n4. Testing chat endpoint...")
    try:
        response = requests.post(
            f"{base_url}/api/chat",
            json={"message": "Hello", "conversation_history": []},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            print("✅ Chat endpoint working")
            print(f"   Response: {data['message'][:100]}...")
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Chat endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Testing completed!")
    print("\nNext steps:")
    print("1. If you see warnings about missing API keys, create a .env file")
    print("2. Copy backend/env.example to backend/.env and add your API keys")
    print("3. Restart the backend server")
    print("4. Run this test again")

if __name__ == "__main__":
    test_backend() 