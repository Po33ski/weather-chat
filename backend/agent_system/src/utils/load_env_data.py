import os
from typing import Optional


def load_env_data():
    """
    Loads environment data from system environment variables only.
    This ensures consistent behavior across local development and production.
    """
    print("Using system environment variables")
    
    # Only verify environment variables in production or when explicitly requested
    if os.getenv("ENVIRONMENT") == "production" or os.getenv("VERIFY_ENV") == "true":
        verify_environment_variables()
    else:
        # In development, just warn about missing variables
        warn_missing_environment_variables()


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
        print("Please set these environment variables in your deployment platform or system environment")
        raise ValueError(error_msg)
    
    print("All required environment variables are available")


def warn_missing_environment_variables():
    """
    Warns about missing environment variables without failing (for development).
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
        print(f"⚠️  WARNING: Missing environment variables: {', '.join(missing_vars)}")
        print("   Some features may not work properly. Set these variables for full functionality.")
        print("   For local development, source env-scratchpad.sh to set environment variables.")
    else:
        print("✅ All required environment variables are available")


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
        str: The value of the GOOGLE_API_KEY variable, or None if not set.
    """
    return os.getenv("GOOGLE_API_KEY")


def load_visual_crossing_api_key():
    """
    Retrieves the VISUAL_CROSSING_API_KEY from environment variables.
    Returns:
        str: The value of the VISUAL_CROSSING_API_KEY variable, or None if not set.
    """
    return os.getenv("VISUAL_CROSSING_API_KEY")


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