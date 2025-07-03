from google.adk.agents import Agent

from ...tools.get_weather import get_weather
from google.adk.tools import google_search
from . import prompt

from ....utils.load_env_data import load_model

plan_activities_agent = Agent(
    model=load_model(),
    name=prompt.PLAN_ACTIVITIES_AGENT_NAME,
    instruction=prompt.PLAN_ACTIVITIES_AGENT_INSTRUCTION,
    tools=[get_weather, google_search],
    output_key='plan_activities_agent_prompt'
)