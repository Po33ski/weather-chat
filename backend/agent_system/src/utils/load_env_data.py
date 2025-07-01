import dotenv
import os
import pathlib


def load_env_data():
    """
    Loads environment data from .env file.
    The .env file is assumed to be in the multi_tool_agent directory.
    The values of MODEL and GOOGLE_API_KEY are loaded from the .env file.
    """
    env_path = pathlib.Path(__file__).parent.parent / "multi_tool_agent" / ".env"
    dotenv.load_dotenv(dotenv_path=env_path)
    print(env_path)

def load_model():
    """
    Retrieves the MODEL environment variable.
    Returns:
        str: The value of the MODEL environment variable, or None if not set.
    """
    return "gemini-2.0-flash" or 0

def load_google_api_key():
    """
    Retrieves the GOOGLE_API_KEY variable directly from the .env file using dotenv.dotenv_values.
    Returns:
        str: The value of the GOOGLE_API_KEY variable, or None if not set.
    """
    env_path = pathlib.Path(__file__).parent.parent / "multi_tool_agent" / ".env"
    values = dotenv.dotenv_values(env_path)
    return values.get("GOOGLE_API_KEY")

def load_disable_web_driver() -> int:
    """
    Retrieves the DISABLE_WEB_DRIVER variable directly from the .env file.
    Returns:
        int: The value of the DISABLE_WEB_DRIVER variable, or 0 if not set.
    """
    value = os.getenv("DISABLE_WEB_DRIVER", 0)
    return int(value)

if __name__ == "__main__":
    load_env_data()