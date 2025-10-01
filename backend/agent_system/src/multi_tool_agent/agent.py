from google.adk.agents import Agent

from . import prompt

from ..utils.load_env_data import load_model
from ..utils.load_env_data import load_google_api_key

from .sub_agents.get_weather.agent import get_weather_agent

MODEL = load_model()
GOOGLE_API_KEY = load_google_api_key()



root_agent = Agent(
    name=prompt.ROOT_NAME,
    model=MODEL,
    description= prompt.ROOT_DESCRIPTION,
    global_instruction=prompt.ROOT_GLOBAL_INSTR,
    instruction=prompt.ROOT_INSTR,
    sub_agents=[get_weather_agent], 
)

