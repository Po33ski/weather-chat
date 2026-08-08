from typing import Any, Dict
from urllib.parse import urlencode

from .hotel_locale import LOCALE_BY_CURRENCY, target_currency


def build_hotel_booking_link(
    hotel_name: str,
    city: str,
    check_in: str = "",
    check_out: str = "",
    language: str = "en",
) -> Dict[str, Any]:
    """
    Build a fallback Booking.com link for one hotel, for use when
    search_hotels did not return a direct (is_direct: true) page for it.

    Booking.com's searchresults.html accepts a free-text "ss" destination
    query. Passing "<hotel name> <city>" makes that specific property show
    up as the top result, so this is a reliable stand-in for a real
    per-hotel deep link even without knowing the property's exact URL slug.

    URL pattern produced:
    https://www.booking.com/searchresults.html?ss=<hotel name>+<city>
    &checkin=<YYYY-MM-DD>&checkout=<YYYY-MM-DD>&selected_currency=PLN|USD&lang=pl|en-us

    Args:
        hotel_name: The hotel's name, exactly as extracted from search
            results (required).
        city: The city the hotel is in — disambiguates the name (required).
        check_in: Check-in date in YYYY-MM-DD format (optional).
        check_out: Check-out date in YYYY-MM-DD format (optional).
        language: ISO 639-1 language code of the chat (from the CONTEXT
            TEMPLATE), used to pick the currency: "pl" -> PLN, anything else -> USD.

    Returns:
        Dict with "url": the constructed booking.com search link,
        or {"error": "..."} if hotel_name or city is missing.
    """
    if not hotel_name:
        return {"error": "No hotel_name provided."}
    if not city:
        return {"error": "No city provided."}

    currency = target_currency(language)
    locale = LOCALE_BY_CURRENCY[currency]

    params = {
        "ss": f"{hotel_name} {city}",
        "selected_currency": currency,
        "lang": locale["booking_lang"],
    }
    if check_in:
        params["checkin"] = check_in
    if check_out:
        params["checkout"] = check_out

    return {"url": f"https://www.booking.com/searchresults.html?{urlencode(params)}"}
