"""Shared utilities for weather tools."""

import re
from urllib.parse import quote

TIMELINE_URL = (
    "https://weather.visualcrossing.com/VisualCrossingWebServices"
    "/rest/services/timeline/"
)


def timeline_url(city: str, *dates: str) -> str | None:
    """Build a Visual Crossing URL, or return None if a segment is unusable.

    These values come from the LLM, which reads them from user text. Left
    unencoded, they could add path segments or query parameters to a request
    that carries our API key.
    """
    # A slash in a place name ("Frankfurt/Main") is not a path separator.
    segments = [re.sub(r"[/\\]+", " ", value).strip() for value in (city, *dates)]
    # quote() leaves dots alone, and "." or ".." would still walk up the path.
    if any(not segment or set(segment) == {"."} for segment in segments):
        return None
    return TIMELINE_URL + "/".join(quote(segment, safe="") for segment in segments)


def timeline_params(api_key: str) -> dict[str, str]:
    """Query parameters shared by every Visual Crossing request."""
    return {"unitGroup": "metric", "key": api_key, "contentType": "json"}


def _time_to_hhmm(value: str | None) -> str | None:
    """Truncate HH:MM:SS to HH:MM."""
    if not value or not isinstance(value, str):
        return value
    parts = value.strip().split(":")
    if len(parts) >= 2:
        return f"{parts[0]}:{parts[1]}"
    return value


def normalize_sunrise_sunset(data: dict) -> dict:
    """Convert sunrise/sunset from HH:MM:SS to HH:MM in API response."""
    result = dict(data)
    if "currentConditions" in result and isinstance(result["currentConditions"], dict):
        current = dict(result["currentConditions"])
        current["sunrise"] = _time_to_hhmm(current.get("sunrise"))
        current["sunset"] = _time_to_hhmm(current.get("sunset"))
        result["currentConditions"] = current
    if "days" in result:
        result["days"] = [
            {
                **day,
                "sunrise": _time_to_hhmm(day.get("sunrise")),
                "sunset": _time_to_hhmm(day.get("sunset")),
            }
            for day in result["days"]
        ]
    return result
