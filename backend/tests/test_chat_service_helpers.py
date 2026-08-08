import json

import pytest

from api.chat_service import (
    _detect_error_in_response,
    _extract_fenced_json,
    _normalize_agent_response,
    _validate_payload,
)


def fenced(fence_type: str, body: str) -> str:
    return f"```{fence_type}\n{body}\n```"


class TestExtractFencedJson:
    @pytest.mark.parametrize(
        "fence_type", ["weather-json", "hotel-json", "combined-json", "json"]
    )
    def test_extracts_each_fence_type(self, fence_type):
        result = _extract_fenced_json(fenced(fence_type, '{"a": 1}'))
        assert result == (fence_type, {"a": 1})

    def test_fence_type_is_case_insensitive(self):
        result = _extract_fenced_json(fenced("Weather-JSON", '{"a": 1}'))
        assert result == ("weather-json", {"a": 1})

    def test_returns_none_without_fence(self):
        assert _extract_fenced_json("just some prose, no code fence") is None

    def test_repairs_trailing_comma_before_closing_brace(self):
        result = _extract_fenced_json(fenced("weather-json", '{"a": 1,}'))
        assert result == ("weather-json", {"a": 1})

    def test_repairs_trailing_comma_before_closing_bracket(self):
        result = _extract_fenced_json(fenced("hotel-json", '{"items": [1, 2,],}'))
        assert result == ("hotel-json", {"items": [1, 2]})

    def test_irreparable_json_raises(self):
        with pytest.raises(json.JSONDecodeError):
            _extract_fenced_json(fenced("weather-json", '{"a": not json at all'))

    def test_first_fence_wins(self):
        text = (
            fenced("weather-json", '{"first": true}')
            + "\n"
            + fenced("hotel-json", '{"second": true}')
        )
        result = _extract_fenced_json(text)
        assert result == ("weather-json", {"first": True})


class TestNormalizeAgentResponse:
    def test_empty_input_returns_error_marker(self):
        assert _normalize_agent_response("") == "[Agent error] No response content"

    def test_no_fence_returns_raw_text_unchanged(self):
        assert _normalize_agent_response("plain answer") == "plain answer"

    def test_human_text_before_fence_is_preserved(self):
        raw = "Here is the weather:\n" + fenced("weather-json", '{"a": 1}')
        normalized = _normalize_agent_response(raw)
        assert normalized.startswith("Here is the weather:\n\n```weather-json\n")
        assert normalized.endswith("\n```")

    def test_repaired_payload_is_reserialized_as_valid_json(self):
        # The raw fence body has a trailing comma; the normalized output must
        # carry the repaired payload, not the original malformed text.
        raw = fenced("weather-json", '{"a": 1,}')
        fence_type, payload = _extract_fenced_json(raw)
        normalized = _normalize_agent_response(raw, fence_type, payload)
        body = normalized.split("```weather-json\n", 1)[1].rsplit("\n```", 1)[0]
        assert json.loads(body) == {"a": 1}

    def test_explicit_fence_type_overrides_label(self):
        raw = fenced("json", '{"a": 1}')
        normalized = _normalize_agent_response(raw, "weather-json", {"a": 1})
        assert "```weather-json\n" in normalized


class TestDetectErrorInResponse:
    def test_empty_response_is_error(self):
        assert _detect_error_in_response("") == (
            True,
            "No response content from agent.",
            None,
            None,
        )

    def test_fenced_error_message_is_surfaced(self):
        is_error, message, fence_type, payload = _detect_error_in_response(
            fenced("weather-json", '{"error": "boom"}')
        )
        assert (is_error, message) == (True, "boom")
        assert fence_type == "weather-json"
        assert payload == {"error": "boom"}

    def test_empty_error_string_gets_generic_message(self):
        is_error, message, _, _ = _detect_error_in_response(
            fenced("weather-json", '{"error": ""}')
        )
        assert (is_error, message) == (True, "Agent encountered an error.")

    def test_malformed_json_is_error(self):
        is_error, message, fence_type, payload = _detect_error_in_response(
            fenced("weather-json", "{broken")
        )
        assert is_error is True
        assert "malformed JSON" in message
        assert (fence_type, payload) == (None, None)

    def test_valid_payload_is_not_error(self):
        is_error, message, fence_type, payload = _detect_error_in_response(
            fenced("hotel-json", '{"hotels": []}')
        )
        assert (is_error, message) == (False, None)
        assert fence_type == "hotel-json"
        assert payload == {"hotels": []}

    def test_plain_prose_is_not_error(self):
        assert _detect_error_in_response("just a friendly answer") == (
            False,
            None,
            None,
            None,
        )


VALID_HOTEL_PAYLOAD = {
    "meta": {"city": "Warsaw", "kind": "hotels", "language": "en"},
    "hotels": [],
}


class TestValidatePayloadRouting:
    def test_hotel_fence_routes_to_hotel_validator(self):
        # Valid for the hotel validator only — the weather validator would
        # reject meta.kind == "hotels".
        _validate_payload("hotel-json", VALID_HOTEL_PAYLOAD)

    def test_hotels_kind_routes_to_hotel_validator_regardless_of_fence(self):
        _validate_payload("json", VALID_HOTEL_PAYLOAD)

    def test_combined_fence_routes_to_combined_validator(self):
        # Only the combined validator demands a "weather" object.
        with pytest.raises(ValueError, match="weather must be an object"):
            _validate_payload(
                "combined-json",
                VALID_HOTEL_PAYLOAD
                | {"meta": {"city": "W", "kind": "combined", "language": "en"}},
            )

    def test_fallback_routes_to_weather_validator(self):
        with pytest.raises(ValueError, match="meta.kind must be one of"):
            _validate_payload(
                "json", {"meta": {"city": "W", "kind": "mystery", "language": "en"}}
            )
