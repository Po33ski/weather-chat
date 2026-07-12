from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool

from . import prompt

from ..utils.load_env_data import load_model
from ..utils.load_env_data import load_google_api_key

from .sub_agents.get_weather.agent import get_weather_agent
from .sub_agents.travel_advice.agent import travel_advice_agent
from .sub_agents.search_hotels.agent import search_hotels_agent

MODEL = load_model()
GOOGLE_API_KEY = load_google_api_key()


root_agent = Agent(
    name=prompt.ROOT_NAME,
    model=MODEL,
    description=prompt.ROOT_DESCRIPTION,
    global_instruction=prompt.ROOT_GLOBAL_INSTR,
    instruction=prompt.ROOT_INSTR,
    # Transfer-based delegation for single-intent turns (root never regains
    # control once transferred).
    sub_agents=[get_weather_agent, travel_advice_agent, search_hotels_agent],
    # Call-and-return versions of the same two agents, used only for the
    # COMBINED QUERY LOGIC path (see prompt.py) where root needs both
    # results back to synthesize one reply.
    tools=[AgentTool(get_weather_agent), AgentTool(search_hotels_agent)],
)
