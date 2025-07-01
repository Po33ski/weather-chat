from google.adk.agents import Agent
from google.adk.tools import google_search

from google.adk.agents import SequentialAgent
from google.adk.agents import LoopAgent

from . import prompt

from ..utils.load_env_data import load_model
from ..utils.load_env_data import load_google_api_key

from .sub_agents.plan_activities.agent import plan_activities_agent
from .tools.get_weather import get_weather

MODEL = load_model()
GOOGLE_API_KEY = load_google_api_key()



root_agent = Agent(
    name=prompt.ROOT_NAME,
    model=MODEL,
    description= prompt.ROOT_DESCRIPTION,
    global_instruction=prompt.ROOT_GLOBAL_INSTR,
    instruction=prompt.ROOT_INSTR,
    sub_agents=[ plan_activities_agent],
    tools=[get_weather],
)

if __name__ == "__main__":
    root_agent