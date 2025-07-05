import dotenv
import os
import pathlib
from typing import Optional


def load_env_data():
    """
    Loads environment data from .env file if it exists, but prioritizes system environment variables.
    This allows for deployment scenarios where environment variables are set by the platform.
    """
    # First, try to load from .env file if it exists (for local development)
    env_path = pathlib.Path(__file__).parent.parent / "multi_tool_agent" / ".env"
    if env_path.exists():
        dotenv.load_dotenv(dotenv_path=env_path)
        print(f"Loaded environment from: {env_path}")
    else:
        print("No .env file found, using system environment variables")
    
    # Verify critical environment variables are available
    verify_environment_variables()


def verify_environment_variables():
    """
    Verifies that critical environment variables are available.
    Raises ValueError if required variables are missing.
    """
    required_vars = {
        'VISUAL_CROSSING_API_KEY': 'Visual Crossing Weather API key',
        'GOOGLE_API_KEY': 'Google Cloud API key for ADK'
    }
    
    missing_vars = []
    for var_name, description in required_vars.items():
        if not os.getenv(var_name):
            missing_vars.append(f"{var_name} ({description})")
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        print(f"ERROR: {error_msg}")
        print("Please set these environment variables in your deployment platform or .env file")
        raise ValueError(error_msg)
    
    print("All required environment variables are available")


def load_model():
    """
    Retrieves the MODEL environment variable.
    Returns:
        str: The value of the MODEL environment variable, or default value.
    """
    return os.getenv("MODEL", "gemini-2.0-flash")


def load_google_api_key():
    """
    Retrieves the GOOGLE_API_KEY from environment variables.
    Returns:
        str: The value of the GOOGLE_API_KEY variable.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")
    return api_key


def load_visual_crossing_api_key():
    """
    Retrieves the VISUAL_CROSSING_API_KEY from environment variables.
    Returns:
        str: The value of the VISUAL_CROSSING_API_KEY variable.
    """
    api_key = os.getenv("VISUAL_CROSSING_API_KEY")
    if not api_key:
        raise ValueError("VISUAL_CROSSING_API_KEY not found in environment variables")
    return api_key


def load_disable_web_driver() -> int:
    """
    Retrieves the DISABLE_WEB_DRIVER variable from environment variables.
    Returns:
        int: The value of the DISABLE_WEB_DRIVER variable, or 0 if not set.
    """
    value = os.getenv("DISABLE_WEB_DRIVER", "0")
    return int(value)


def get_environment_info() -> dict:
    """
    Returns information about the current environment setup.
    Useful for debugging deployment issues.
    """
    return {
        "has_google_api_key": bool(os.getenv("GOOGLE_API_KEY")),
        "has_visual_crossing_api_key": bool(os.getenv("VISUAL_CROSSING_API_KEY")),
        "model": load_model(),
        "disable_web_driver": load_disable_web_driver(),
        "environment": os.getenv("NODE_ENV", "development")
    }


if __name__ == "__main__":
    load_env_data()
    print("Environment loaded successfully!")
    print("Environment info:", get_environment_info())