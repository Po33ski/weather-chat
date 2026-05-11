import os
from typing import Any, Dict

from .exceptions import ToolConfigurationError


def search_hotels(city: str, check_in: str = "", check_out: str = "") -> Dict[str, Any]:
    """
    Search for hotels in a given city using Tavily web search.
    Returns raw search results from booking sites so the agent can extract
    structured hotel data (name, price, rating, reviews, highlights).

    Args:
        city: The city name to search hotels in (required).
        check_in: Check-in date in YYYY-MM-DD format (optional).
        check_out: Check-out date in YYYY-MM-DD format (optional).

    Returns:
        Dict with "results" list (each entry has url, title, content, score)
        or {"error": "..."} on failure.
    """
    if not city:
        return {"error": "No city provided."}

    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return {"error": "Hotel search API key (TAVILY_API_KEY) is not configured."}

    try:
        from tavily import TavilyClient
    except ImportError:
        return {"error": "Hotel search library is not installed. Run: pip install tavily-python"}

    date_hint = ""
    if check_in:
        date_hint += f" check-in {check_in}"
    if check_out:
        date_hint += f" check-out {check_out}"

    query = f"hotels in {city}{date_hint} price per night rating reviews booking"

    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_domains=["booking.com", "hotels.com", "tripadvisor.com"],
        )

        results = response.get("results", [])
        if not results:
            return {"error": f"No hotel results found for '{city}'."}

        simplified = [
            {
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0.0),
            }
            for r in results
        ]

        return {"city": city, "check_in": check_in, "check_out": check_out, "results": simplified}

    except Exception as exc:
        return {"error": f"Hotel search failed: {str(exc)}"}
