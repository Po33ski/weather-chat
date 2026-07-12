from typing import Any, Optional

from google.adk.agents import Agent

from ...tools.get_current_weather import get_current_weather
from ...tools.get_forecast import get_forecast
from ...tools.get_history_weather import get_history_weather
from . import prompt

from ....utils.load_env_data import load_model


def _after_tool_callback(
    tool: Any,
    args: dict[str, Any],
    tool_context: Any,
    tool_response: dict[str, Any],
) -> Optional[dict[str, Any]]:
    """
    Safety net: normalize tool error responses to {"error": "..."} format.

    Tools return {"error": "..."} on failure. This callback ensures the format
    is always consistent before the response reaches the LLM, regardless of
    what the tool returned.
    """
    if isinstance(tool_response, dict) and "error" in tool_response:
        error_msg = str(tool_response.get("error") or "Tool returned an unknown error.")
        return {"error": error_msg}
    return None  # Successful responses are passed through unchanged


get_weather_agent = Agent(
    model=load_model(),
    name=prompt.GET_WEATHER_AGENT_NAME,
    instruction=prompt.GET_WEATHER_AGENT_INSTRUCTION,
    tools=[get_current_weather, get_forecast, get_history_weather],
    output_key='get_weather_agent_prompt',
    after_tool_callback=_after_tool_callback,
)
