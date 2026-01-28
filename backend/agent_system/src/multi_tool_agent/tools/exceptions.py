"""
Custom exceptions for tool errors.
"""


class ToolError(Exception):
    """Base exception for tool errors."""
    pass


class ToolValidationError(ToolError):
    """Raised when tool input validation fails."""
    pass


class ToolAPIError(ToolError):
    """Raised when external API call fails."""
    pass


class ToolConfigurationError(ToolError):
    """Raised when tool configuration is missing or invalid."""
    pass
