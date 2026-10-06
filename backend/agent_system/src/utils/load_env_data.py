import os


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
        "VISUAL_CROSSING_API_KEY": "Visual Crossing Weather API key",
        "GOOGLE_API_KEY": "Google Cloud API key for ADK",
    }

    missing_vars = []
    for var_name, description in required_vars.items():
        if not os.getenv(var_name):
            missing_vars.append(f"{var_name} ({description})")

    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        print(f"ERROR: {error_msg}")
        print(
            "Please set these environment variables in your deployment "
            "platform or system environment"
        )
        raise ValueError(error_msg)

    print("All required environment variables are available")


def warn_missing_environment_variables():
    """
    Warns about missing environment variables without failing (for development).
    """
    required_vars = {
        "VISUAL_CROSSING_API_KEY": "Visual Crossing Weather API key",
        "GOOGLE_API_KEY": "Google Cloud API key for ADK",
    }

    missing_vars = []
    for var_name, description in required_vars.items():
        if not os.getenv(var_name):
            missing_vars.append(f"{var_name} ({description})")

    if missing_vars:
        print(f"⚠️  WARNING: Missing environment variables: {', '.join(missing_vars)}")
        print(
            "   Some features may not work properly. "
            "Set these variables for full functionality."
        )
        print(
            "   For local development, source env-scratchpad.sh "
            "to set environment variables."
        )
    else:
        print("✅ All required environment variables are available")


def load_model():
    """
    Retrieves the MODEL environment variable.
    Returns:
        str: The value of the MODEL environment variable, or default value.
    """
    return os.getenv("MODEL", "gemini-2.5-flash")


def get_environment_info() -> dict:
    """
    Returns information about the current environment setup.
    Useful for debugging deployment issues.
    """
    return {
        "has_google_api_key": bool(os.getenv("GOOGLE_API_KEY")),
        "has_visual_crossing_api_key": bool(os.getenv("VISUAL_CROSSING_API_KEY")),
        "model": load_model(),
        "environment": os.getenv("NODE_ENV", "development"),
    }
