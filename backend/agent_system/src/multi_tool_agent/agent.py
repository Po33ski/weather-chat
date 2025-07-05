from google.adk.agents import Agent
from google.adk.tools import google_search

from google.adk.agents import SequentialAgent
from google.adk.agents import LoopAgent

from . import prompt

from ..utils.load_env_data import load_model
from ..utils.load_env_data import load_google_api_key

from .sub_agents.plan_activities.agent import plan_activities_agent
from .sub_agents.ask_for_plan.agent import ask_for_plan_agent
from .sub_agents.get_weather.agent import get_weather_agent
from .tools.get_current_weather import get_current_weather
from .tools.get_forecast import get_forecast
from .tools.get_history_weather import get_history_weather
from .tools.get_date import get_date
from .tools.get_week_day import get_week_day

MODEL = load_model()
GOOGLE_API_KEY = load_google_api_key()



root_agent = Agent(
    name=prompt.ROOT_NAME,
    model=MODEL,
    description= prompt.ROOT_DESCRIPTION,
    global_instruction=prompt.ROOT_GLOBAL_INSTR,
    instruction=prompt.ROOT_INSTR,
    sub_agents=[plan_activities_agent, ask_for_plan_agent, get_weather_agent], 
    tools=[get_current_weather, get_forecast, get_history_weather, get_date, get_week_day],
)

