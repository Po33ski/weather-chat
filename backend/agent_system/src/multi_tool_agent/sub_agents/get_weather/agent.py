from google.adk.agents import Agent

from ...tools.get_current_weather import get_current_weather
from ...tools.get_forecast import get_forecast
from ...tools.get_history_weather import get_history_weather
from ...tools.get_date import get_date
from ...tools.get_week_day import get_week_day
from ...tools.systems_convert import convert_weather_data
from ...tools.get_session_unit_system import get_session_unit_system
from . import prompt

from ....utils.load_env_data import load_model

get_weather_agent = Agent(
    model=load_model(),
    name=prompt.GET_WEATHER_AGENT_NAME,
    instruction=prompt.GET_WEATHER_AGENT_INSTRUCTION,
    tools=[get_current_weather, get_forecast, get_history_weather, get_date, get_week_day, convert_weather_data, get_session_unit_system],
    output_key='get_weather_agent_prompt'
) 