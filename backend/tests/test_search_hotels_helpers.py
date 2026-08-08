from urllib.parse import parse_qsl, urlsplit

import pytest

from agent_system.src.multi_tool_agent.tools.search_hotels import (
    _force_currency,
    _is_direct_hotel_url,
)


class TestForceCurrency:
    def test_booking_url_gains_currency_and_lang(self):
        url = _force_currency("https://www.booking.com/hotel/pl/xyz.html", "PLN")
        query = dict(parse_qsl(urlsplit(url).query))
        assert query["selected_currency"] == "PLN"
        assert query["lang"] == "pl"

    def test_existing_query_params_are_preserved(self):
        url = _force_currency(
            "https://www.booking.com/hotel/pl/xyz.html?checkin=2026-08-08&group_adults=2",
            "USD",
        )
        query = dict(parse_qsl(urlsplit(url).query))
        assert query["checkin"] == "2026-08-08"
        assert query["group_adults"] == "2"
        assert query["selected_currency"] == "USD"
        assert query["lang"] == "en-us"

    def test_non_booking_url_is_untouched(self):
        url = "https://www.tripadvisor.com/Hotel_Review-g274856.html?src=x"
        assert _force_currency(url, "PLN") == url


class TestIsDirectHotelUrl:
    def test_direct_hotel_page_is_direct(self):
        assert _is_direct_hotel_url("https://www.booking.com/hotel/pl/xyz.html") is True

    def test_reviews_page_is_not_direct(self):
        assert (
            _is_direct_hotel_url("https://www.booking.com/reviews/pl/hotel/xyz.html")
            is False
        )

    def test_city_overview_page_is_not_direct(self):
        assert (
            _is_direct_hotel_url("https://www.booking.com/city/pl/warsaw.html") is False
        )

    @pytest.mark.parametrize(
        "url",
        [
            "https://example.com/?next=/hotel/x",
            "https://example.com/search#/hotel/x",
        ],
    )
    def test_hotel_outside_path_does_not_count(self, url):
        assert _is_direct_hotel_url(url) is False
