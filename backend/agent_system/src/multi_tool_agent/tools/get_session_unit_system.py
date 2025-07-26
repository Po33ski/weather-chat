import json
import re

def get_session_unit_system() -> str:
    """
    Get the current unit system from the session state.
    This tool allows the agent to check what unit system the user prefers.
    
    Returns:
        JSON string with the current unit system: {"unit_system": "US|METRIC|UK"}
    """
    try:
        # This tool should be called by the agent to get the unit system
        # The unit system is passed in the user message as [UNIT_SYSTEM: X]
        # For now, we'll return a default and let the agent know to check the message context
        return json.dumps({
            "unit_system": "METRIC",
            "note": "The unit system should be extracted from the user message context. Look for [UNIT_SYSTEM: X] in the conversation history.",
            "instructions": "Check the user message for [UNIT_SYSTEM: X] format to get the current unit system"
        })
    except Exception as e:
        return json.dumps({"error": f"Error getting unit system: {str(e)}"})

def extract_unit_system_from_message(message: str) -> str:
    """
    Extract unit system from a message that contains [UNIT_SYSTEM: X] format.
    
    Args:
        message: The message to parse
        
    Returns:
        The unit system (US, METRIC, UK) or "METRIC" as default
    """
    try:
        # Look for [UNIT_SYSTEM: X] pattern
        match = re.search(r'\[UNIT_SYSTEM:\s*(\w+)\]', message)
        if match:
            unit_system = match.group(1).upper()
            if unit_system in ["US", "METRIC", "UK"]:
                return unit_system
        return "METRIC"  # Default
    except:
        return "METRIC"  # Default 