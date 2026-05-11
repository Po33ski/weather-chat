from typing import Any, Optional

from google.adk.agents import Agent

from ...tools.search_hotels import search_hotels
from . import prompt
from ....utils.load_env_data import load_model


def _after_tool_callback(
    tool: Any,
    args: dict[str, Any],
    tool_context: Any,
    tool_response: dict[str, Any],
) -> Optional[dict[str, Any]]:
    """Normalize tool error responses to {"error": "..."} format."""
    if isinstance(tool_response, dict) and "error" in tool_response:
        error_msg = str(tool_response.get("error") or "Hotel search returned an unknown error.")
        return {"error": error_msg}
    return None


search_hotels_agent = Agent(
    model=load_model(),
    name=prompt.SEARCH_HOTELS_AGENT_NAME,
    instruction=prompt.SEARCH_HOTELS_AGENT_INSTRUCTION,
    tools=[search_hotels],
    output_key="search_hotels_agent_output",
    after_tool_callback=_after_tool_callback,
)
