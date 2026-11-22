import json
from urllib.parse import parse_qs, urlsplit

import pytest
import requests

from agent_system.src.multi_tool_agent.tools.get_current_weather import (
    get_current_weather,
)
from agent_system.src.multi_tool_agent.tools.get_forecast import get_forecast
from agent_system.src.multi_tool_agent.tools.get_history_weather import (
    get_history_weather,
)
from agent_system.src.multi_tool_agent.tools.utils import (
    TIMELINE_URL,
    normalize_sunrise_sunset,
    timeline_url,
)

DATES = ("2026-01-01", "2026-01-02")
TOOLS = [
    pytest.param(get_current_weather, (), id="current"),
    pytest.param(get_forecast, (), id="forecast"),
    pytest.param(get_history_weather, DATES, id="history"),
]


def api_response(status: int = 200, body: bytes = b"{}") -> requests.Response:
    response = requests.Response()
    response.status_code = status
    response._content = body
    return response


@pytest.fixture
def sent(monkeypatch):
    """Replace the network call and record the URL that would have been sent."""
    monkeypatch.setenv("VISUAL_CROSSING_API_KEY", "test-key")
    urls: list[str] = []

    def fake_get(url, params=None, timeout=None):
        assert timeout == 10
        urls.append(requests.Request("GET", url, params=params).prepare().url)
        return api_response()

    monkeypatch.setattr(requests, "get", fake_get)
    return urls


def fail_with(monkeypatch, outcome) -> None:
    monkeypatch.setenv("VISUAL_CROSSING_API_KEY", "test-key")

    def fake_get(url, params=None, timeout=None):
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    monkeypatch.setattr(requests, "get", fake_get)


@pytest.mark.parametrize(("tool", "dates"), TOOLS)
class TestRequestIsolation:
    def test_city_cannot_override_query_parameters(self, tool, dates, sent):
        tool("Paris?unitGroup=us&x=", *dates)
        parts = urlsplit(sent[0])
        query = parse_qs(parts.query)
        assert "Paris%3FunitGroup%3Dus%26x%3D" in parts.path
        assert query["unitGroup"] == ["metric"]
        assert query["key"] == ["test-key"]
        assert "x" not in query

    def test_city_cannot_leave_the_timeline_path(self, tool, dates, sent):
        tool("../../../other", *dates)
        assert sent[0].startswith(TIMELINE_URL)

    def test_slash_in_city_is_not_a_path_separator(self, tool, dates, sent):
        tool("Frankfurt/Main", *dates)
        assert (
            urlsplit(sent[0]).path.split("/timeline/")[1].startswith("Frankfurt%20Main")
        )

    @pytest.mark.parametrize("city", [".", "..", "...", " / ", "   "])
    def test_unusable_city_never_reaches_the_api(self, tool, dates, sent, city):
        assert "error" in tool(city, *dates)
        assert sent == []

    def test_missing_city_is_an_error(self, tool, dates, sent):
        assert tool("", *dates) == {"error": "No city provided."}
        assert sent == []

    def test_missing_api_key_is_an_error(self, tool, dates, monkeypatch):
        monkeypatch.delenv("VISUAL_CROSSING_API_KEY", raising=False)
        assert "not configured" in tool("Warsaw", *dates)["error"]


@pytest.mark.parametrize(("tool", "dates"), TOOLS)
class TestErrorMapping:
    def test_bad_request_names_the_city(self, tool, dates, monkeypatch):
        fail_with(monkeypatch, api_response(400))
        assert "Atlantis" in tool("Atlantis", *dates)["error"]

    def test_server_error_reports_status(self, tool, dates, monkeypatch):
        fail_with(monkeypatch, api_response(503))
        assert "503" in tool("Warsaw", *dates)["error"]

    def test_timeout(self, tool, dates, monkeypatch):
        fail_with(monkeypatch, requests.exceptions.Timeout())
        assert "timed out" in tool("Warsaw", *dates)["error"]

    def test_connection_error_hides_the_url(self, tool, dates, monkeypatch):
        fail_with(
            monkeypatch, requests.exceptions.ConnectionError("https://x?key=test-key")
        )
        assert "test-key" not in tool("Warsaw", *dates)["error"]

    def test_invalid_json_is_an_error(self, tool, dates, monkeypatch):
        fail_with(monkeypatch, api_response(200, b"<html>"))
        assert "error" in tool("Warsaw", *dates)

    def test_success_normalizes_sun_times(self, tool, dates, monkeypatch):
        body = {"days": [{"sunrise": "06:10:11", "sunset": "19:20:21"}]}
        fail_with(monkeypatch, api_response(200, json.dumps(body).encode()))
        day = tool("Warsaw", *dates)["days"][0]
        assert (day["sunrise"], day["sunset"]) == ("06:10", "19:20")


class TestHistoryDates:
    @pytest.mark.parametrize("dates", [("", "2026-01-02"), ("2026-01-01", "")])
    def test_both_dates_are_required(self, dates, sent):
        assert "required" in get_history_weather("Warsaw", *dates)["error"]
        assert sent == []

    def test_dot_segment_date_is_rejected(self, sent):
        assert "error" in get_history_weather("Warsaw", "..", "2026-01-02")
        assert sent == []

    def test_dates_become_path_segments(self, sent):
        get_history_weather("Warsaw", *DATES)
        assert urlsplit(sent[0]).path.endswith("/Warsaw/2026-01-01/2026-01-02")


class TestHelpers:
    def test_unicode_city_is_percent_encoded(self):
        assert timeline_url("Kraków") == f"{TIMELINE_URL}Krak%C3%B3w"

    def test_missing_sun_times_stay_none(self):
        # Polar night: the key may be absent; validators accept null for it.
        result = normalize_sunrise_sunset({"days": [{"temp": -5}]})
        assert result["days"][0]["sunrise"] is None
        assert result["days"][0]["sunset"] is None

    def test_current_conditions_are_normalized(self):
        result = normalize_sunrise_sunset(
            {"currentConditions": {"sunrise": "07:01:02", "sunset": "16:03:04"}}
        )
        assert result["currentConditions"]["sunrise"] == "07:01"
        assert result["currentConditions"]["sunset"] == "16:03"
