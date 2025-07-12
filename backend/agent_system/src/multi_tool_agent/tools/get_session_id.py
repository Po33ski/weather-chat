import json

def get_session_id(tool_context=None) -> str:
    """
    Get the session ID from the ADK session state.
    
    Args:
        tool_context: The ADK tool context (automatically provided)
    
    Returns:
        JSON string with the session ID
    """
    try:
        session_id = "anonymous"
        
        if tool_context and hasattr(tool_context, 'state'):
            # Try to get session_id from ADK session state
            session_id = tool_context.state.get("app_session_id", "anonymous")
        elif tool_context and hasattr(tool_context, 'session') and hasattr(tool_context.session, 'state'):
            # Alternative way to access session state
            session_id = tool_context.session.state.get("app_session_id", "anonymous")
        
        return json.dumps({"session_id": session_id})
        
    except Exception as e:
        return json.dumps({"error": f"Error getting session ID: {str(e)}"}) 