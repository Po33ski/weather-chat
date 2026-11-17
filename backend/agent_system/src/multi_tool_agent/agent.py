from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from google.genai import types

from ..utils.load_env_data import load_model
from . import prompt
from .sub_agents.get_weather.agent import get_weather_agent
from .sub_agents.search_hotels.agent import search_hotels_agent
from .sub_agents.travel_advice.agent import travel_advice_agent

root_agent = Agent(
    name=prompt.ROOT_NAME,
    model=load_model(),
    description=prompt.ROOT_DESCRIPTION,
    global_instruction=prompt.ROOT_GLOBAL_INSTR,
    instruction=prompt.ROOT_INSTR,
    # The model defaults to MINIMAL thinking, too little for routing plus the
    # multi-call COMBINED path. Temperature stays at the Gemini 3 default (1.0);
    # lower values can cause looping.
    generate_content_config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level=types.ThinkingLevel.MEDIUM),
    ),
    # Transfer-based delegation for single-intent turns (root never regains
    # control once transferred).
    sub_agents=[get_weather_agent, travel_advice_agent, search_hotels_agent],
    # Call-and-return versions of the same two agents, used only for the
    # COMBINED QUERY LOGIC path (see prompt.py) where root needs both
    # results back to synthesize one reply.
    tools=[AgentTool(get_weather_agent), AgentTool(search_hotels_agent)],
)
