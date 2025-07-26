#!/usr/bin/env python3
"""
Dependency sync script for Weather Center Chat Backend
This script helps sync dependencies using uv and verifies the setup.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"   Error: {e.stderr}")
        return False

def check_uv_installed():
    """Check if uv is installed."""
    try:
        subprocess.run(["uv", "--version"], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def test_health_endpoint():
    """Test the health endpoint if the server is running."""
    try:
        # Try to import requests after dependencies are installed
        import requests
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running and healthy")
            return True
        else:
            print("⚠️  Backend server responded but health check failed")
            return False
    except ImportError:
        print("ℹ️  requests not available yet (will be installed by uv)")
        return False
    except requests.exceptions.RequestException:
        print("ℹ️  Backend server is not running (this is normal if you haven't started it)")
        return False

def main():
    print("🌤️  Weather Center Chat - Dependency Sync")
    print("=" * 50)
    
    # Check if we're in the backend directory
    if not Path("pyproject.toml").exists():
        print("❌ Error: This script must be run from the backend directory")
        print("   Please run: cd backend && python sync_deps.py")
        sys.exit(1)
    
    # Check if uv is installed
    if not check_uv_installed():
        print("❌ uv is not installed. Please install it first:")
        print("   pip install uv")
        print("   or visit: https://docs.astral.sh/uv/getting-started/installation/")
        sys.exit(1)
    
    print("✅ uv is installed")
    
    # Sync dependencies
    if not run_command("uv sync", "Syncing dependencies"):
        sys.exit(1)
    
    # Sync dev dependencies
    if not run_command("uv sync --dev", "Syncing development dependencies"):
        sys.exit(1)
    
    # Test the application
    print("\n🧪 Testing the application...")
    
    # Test health endpoint (if server is running)
    test_health_endpoint()
    
    print("\n🎉 Dependency sync completed!")
    print("\nNext steps:")
    print("1. Set up environment variables:")
        print("   source ../env-scratchpad.sh")
    print("   # Edit env-scratchpad.sh with your API keys")
    print("\n2. Start the server:")
    print("   uv run uvicorn api.main:app --reload")
    print("\n3. Test the application:")
    print("   python ../test_local.py")

if __name__ == "__main__":
    main() 