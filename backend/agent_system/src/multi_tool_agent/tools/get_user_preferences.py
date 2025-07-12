import json

# Global variable to store user preferences (in a real app, this would be in a database)
_user_preferences = {}

def get_user_preferences(session_id: str) -> str:
    """
    Get user preferences including unit system from the session.
    
    Args:
        session_id: The user's session ID
    
    Returns:
        JSON string with user preferences
    """
    try:
        if not session_id:
            return json.dumps({"error": "No session ID provided"})
        
        # Get preferences from our global storage
        preferences = _user_preferences.get(session_id, {
            "unit_system": "METRIC",  # Default to METRIC
            "user_id": "anonymous",
            "email": "anonymous@example.com",
            "name": "Anonymous User"
        })
        
        return json.dumps(preferences, indent=2)
        
    except Exception as e:
        return json.dumps({"error": f"Error getting user preferences: {str(e)}"})

def set_user_preferences(session_id: str, preferences: dict) -> str:
    """
    Set user preferences including unit system.
    
    Args:
        session_id: The user's session ID
        preferences: Dictionary containing user preferences
    
    Returns:
        JSON string with success/error message
    """
    try:
        if not session_id:
            return json.dumps({"error": "No session ID provided"})
        
        # Store preferences in our global storage
        _user_preferences[session_id] = preferences
        
        return json.dumps({"success": True, "message": "Preferences updated successfully"})
        
    except Exception as e:
        return json.dumps({"error": f"Error setting user preferences: {str(e)}"}) 