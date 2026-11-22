from urllib.parse import parse_qs, urlsplit

import pytest
import tavily

from agent_system.src.multi_tool_agent.tools.build_hotel_booking_link import (
    build_hotel_booking_link,
)
from agent_system.src.multi_tool_agent.tools.search_hotels import search_hotels

DIRECT = "https://www.booking.com/hotel/pl/grand.html"
OVERVIEW = "https://www.tripadvisor.com/Hotels-Warsaw"


def use_tavily(monkeypatch, results=None, error=None) -> dict:
    """Replace the Tavily client and record the search arguments."""
    monkeypatch.setenv("TAVILY_API_KEY", "test-key")
    seen: dict = {}

    class FakeClient:
        def __init__(self, api_key):
            seen["api_key"] = api_key

        def search(self, **kwargs):
            seen.update(kwargs)
            if error:
                raise error
            return {"results": results or []}

    monkeypatch.setattr(tavily, "TavilyClient", FakeClient)
    return seen


class TestSearchHotels:
    def test_missing_city_is_an_error(self):
        assert search_hotels("") == {"error": "No city provided."}

    def test_missing_api_key_is_an_error(self, monkeypatch):
        monkeypatch.delenv("TAVILY_API_KEY", raising=False)
        assert "not configured" in search_hotels("Warsaw")["error"]

    def test_no_results_is_an_error(self, monkeypatch):
        use_tavily(monkeypatch)
        assert "No hotel results" in search_hotels("Warsaw")["error"]

    def test_client_failure_is_returned_not_raised(self, monkeypatch):
        use_tavily(monkeypatch, error=RuntimeError("boom"))
        assert "Hotel search failed" in search_hotels("Warsaw")["error"]

    def test_direct_pages_come_first(self, monkeypatch):
        use_tavily(monkeypatch, [{"url": OVERVIEW}, {"url": DIRECT}])
        results = search_hotels("Warsaw")["results"]
        assert [r["is_direct"] for r in results] == [True, False]

    @pytest.mark.parametrize(
        ("language", "currency", "country", "word"),
        [("pl", "PLN", "poland", "hotele"), ("en", "USD", "united states", "hotels")],
    )
    def test_language_sets_currency_and_query(
        self, monkeypatch, language, currency, country, word
    ):
        seen = use_tavily(monkeypatch, [{"url": DIRECT}])
        result = search_hotels("Warsaw", language=language)
        assert result["target_currency"] == currency
        assert seen["country"] == country
        assert seen["query"].startswith(word)

    def test_booking_links_get_the_target_currency(self, monkeypatch):
        use_tavily(monkeypatch, [{"url": DIRECT}])
        url = search_hotels("Warsaw", language="pl")["results"][0]["url"]
        query = parse_qs(urlsplit(url).query)
        assert query["selected_currency"] == ["PLN"]
        assert query["lang"] == ["pl"]

    def test_dates_are_part_of_the_query(self, monkeypatch):
        seen = use_tavily(monkeypatch, [{"url": DIRECT}])
        search_hotels("Warsaw", "2026-12-01", "2026-12-03")
        assert "check-in 2026-12-01" in seen["query"]
        assert "check-out 2026-12-03" in seen["query"]


class TestBuildHotelBookingLink:
    @pytest.mark.parametrize(("name", "city"), [("", "Warsaw"), ("Grand", "")])
    def test_name_and_city_are_required(self, name, city):
        assert "error" in build_hotel_booking_link(name, city)

    def test_values_are_encoded_into_one_query(self):
        url = build_hotel_booking_link("A&B Hotel", "Kraków", language="pl")["url"]
        query = parse_qs(urlsplit(url).query)
        assert query["ss"] == ["A&B Hotel Kraków"]
        assert query["selected_currency"] == ["PLN"]
        assert "checkin" not in query

    def test_dates_are_included_when_given(self):
        url = build_hotel_booking_link("Grand", "Warsaw", "2026-12-01", "2026-12-03")[
            "url"
        ]
        query = parse_qs(urlsplit(url).query)
        assert query["checkin"] == ["2026-12-01"]
        assert query["checkout"] == ["2026-12-03"]
        assert query["selected_currency"] == ["USD"]
