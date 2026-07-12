"""Shared currency/locale helpers used by both hotel search tools.

Booking.com renders prices in whatever currency/language is selected via
its query params, so search_hotels and build_hotel_booking_link both need
to agree on the same target currency for a given chat language to keep
hotel offers consistent.
"""

LOCALE_BY_CURRENCY = {
    "PLN": {"country": "poland", "booking_lang": "pl"},
    "USD": {"country": "united states", "booking_lang": "en-us"},
}


def target_currency(language: str) -> str:
    return "PLN" if (language or "").strip().lower().startswith("pl") else "USD"
