from google.adk.agents import Agent

from . import prompt

from ....utils.load_env_data import load_model

ask_for_plan_agent = Agent(
    model=load_model(),
    name=prompt.ASK_FOR_PLAN_AGENT_NAME,
    instruction=prompt.ASK_FOR_PLAN_AGENT_INSTRUCTION,
    tools=[],
    output_key='plan_activities_agent_prompt'
)