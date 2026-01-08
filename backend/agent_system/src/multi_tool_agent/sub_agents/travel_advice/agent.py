from google.adk.agents import Agent

from . import prompt

from ....utils.load_env_data import load_model


travel_advice_agent = Agent(
    model=load_model(),
    name=prompt.TRAVEL_ADVICE_AGENT_NAME,
    instruction=prompt.TRAVEL_ADVICE_AGENT_INSTRUCTION,
    output_key="travel_advice_agent_output",
)

