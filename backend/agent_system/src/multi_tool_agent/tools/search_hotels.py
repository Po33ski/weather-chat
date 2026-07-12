import os
from typing import Any, Dict
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from .exceptions import ToolConfigurationError
from .hotel_locale import LOCALE_BY_CURRENCY, target_currency as _target_currency


def _force_currency(url: str, currency: str) -> str:
    """Force booking.com links to the target currency/locale."""
    if "booking.com" not in url:
        return url

    locale = LOCALE_BY_CURRENCY[currency]
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query))
    query["selected_currency"] = currency
    query["lang"] = locale["booking_lang"]
    return urlunsplit(parts._replace(query=urlencode(query)))


def _is_direct_hotel_url(url: str) -> bool:
    """Direct single-property pages (e.g. booking.com/hotel/pl/xyz.html) are
    more useful to the user than city/category overview pages. Excludes
    /reviews/.../hotel/... pages, which also match "/hotel/" but link to a
    review listing rather than the bookable property page."""
    path = urlsplit(url).path
    return "/hotel/" in path and "/reviews/" not in path


def search_hotels(city: str, check_in: str = "", check_out: str = "", language: str = "en") -> Dict[str, Any]:
    """
    Search for hotels in a given city using Tavily web search.
    Returns raw search results from booking sites so the agent can extract
    structured hotel data (name, price, rating, reviews, highlights).

    Args:
        city: The city name to search hotels in (required).
        check_in: Check-in date in YYYY-MM-DD format (optional).
        check_out: Check-out date in YYYY-MM-DD format (optional).
        language: ISO 639-1 language code of the chat (from the CONTEXT
            TEMPLATE), used to pick the target currency: "pl" -> PLN,
            anything else -> USD.

    Returns:
        Dict with "target_currency" (PLN or USD, the ONLY currency the agent
        should report) and "results" list (each entry has url, title,
        content, score, is_direct — is_direct is True when url points at a
        single hotel's own page rather than a city/category overview page),
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

    currency = _target_currency(language)
    locale = LOCALE_BY_CURRENCY[currency]

    date_hint = ""
    if check_in:
        date_hint += f" check-in {check_in}"
    if check_out:
        date_hint += f" check-out {check_out}"

    if currency == "PLN":
        query = f"hotele {city}{date_hint} cena za noc w złotówkach opinie rezerwacja"
    else:
        query = f"hotels in {city}{date_hint} price per night USD rating reviews booking"

    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            search_depth="advanced",
            max_results=8,
            include_domains=["booking.com", "hotels.com", "tripadvisor.com"],
            country=locale["country"],
        )

        results = response.get("results", [])
        if not results:
            return {"error": f"No hotel results found for '{city}'."}

        simplified = [
            {
                "url": _force_currency(r.get("url", ""), currency),
                "title": r.get("title", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0.0),
                "is_direct": _is_direct_hotel_url(r.get("url", "")),
            }
            for r in results
        ]
        # Direct single-property pages first — they're more useful to the
        # user than generic city/category overview pages.
        simplified.sort(key=lambda r: not r["is_direct"])

        return {
            "city": city,
            "check_in": check_in,
            "check_out": check_out,
            "target_currency": currency,
            "results": simplified,
        }

    except Exception as exc:
        return {"error": f"Hotel search failed: {str(exc)}"}
