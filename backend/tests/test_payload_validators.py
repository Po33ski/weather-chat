import pytest

from api.combined_payload import validate_combined_payload
from api.hotel_payload import Hotel, validate_hotel_payload
from api.weather_payload import validate_weather_payload

CURRENT_WEATHER = {
    "temp": 21.5,
    "tempmax": 25.0,
    "tempmin": 15.0,
    "windspeed": 10.0,
    "winddir": 180.0,
    "pressure": 1013.0,
    "humidity": 60.0,
    "sunrise": "05:30",
    "sunset": "20:15",
    "conditions": "Clear",
}

DAY_WEATHER = CURRENT_WEATHER | {"datetime": "2026-08-08"}


class TestHotelFieldSanitization:
    def test_javascript_url_is_stripped(self):
        assert Hotel(name="H", url="javascript:alert(1)").url == ""

    def test_data_url_is_stripped(self):
        assert Hotel(name="H", url="data:text/html;base64,PHNjcmlwdD4=").url == ""

    @pytest.mark.parametrize(
        "url", ["http://example.com/h", "https://booking.com/hotel/pl/x.html"]
    )
    def test_http_and_https_pass_through(self, url):
        assert Hotel(name="H", url=url).url == url

    def test_url_whitespace_is_stripped(self):
        assert (
            Hotel(name="H", url="  https://example.com  ").url == "https://example.com"
        )

    def test_availability_normalizes_available(self):
        assert Hotel(name="H", availability=" Available ").availability == "available"

    @pytest.mark.parametrize("value", [None, "yes", 3, "sold out"])
    def test_availability_falls_back_to_unknown(self, value):
        assert Hotel(name="H", availability=value).availability == "unknown"

    @pytest.mark.parametrize("value", [11, -1, 10.5])
    def test_out_of_range_rating_becomes_none(self, value):
        assert Hotel(name="H", rating=value).rating is None

    def test_valid_rating_is_kept(self):
        assert Hotel(name="H", rating=8.5).rating == 8.5
        assert Hotel(name="H", rating=None).rating is None

    @pytest.mark.parametrize(
        ("value", "expected"),
        [("8.5", 8.5), ("8,5", 8.5), ("8.5/10", 8.5), ("4.5/5", None), ("n/a", None)],
    )
    def test_rating_strings(self, value, expected):
        assert Hotel(name="H", rating=value).rating == expected

    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            (120, "120"),
            (120.0, "120"),
            (99.5, "99.5"),
            ("120", "120"),
            (None, ""),
            (True, ""),
        ],
    )
    def test_price_becomes_text(self, value, expected):
        assert Hotel(name="H", price_per_night=value).price_per_night == expected

    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            (1234, 1234),
            (12.0, 12),
            ("1,234", 1234),
            ("1 234", 1234),
            ("many", None),
            (-3, None),
            (12.5, None),
        ],
    )
    def test_reviews_count(self, value, expected):
        assert Hotel(name="H", reviews_count=value).reviews_count == expected

    @pytest.mark.parametrize("field", ["url", "currency"])
    def test_null_text_fields_become_empty(self, field):
        assert getattr(Hotel(name="H", **{field: None}), field) == ""

    @pytest.mark.parametrize(
        ("value", "expected"),
        [(None, []), ("spa", []), (["spa", 7, " ", " gym "], ["spa", "gym"])],
    )
    def test_highlights_keep_only_text(self, value, expected):
        assert Hotel(name="H", highlights=value).highlights == expected


class TestHotelPayload:
    def test_empty_hotels_list_is_valid(self):
        validate_hotel_payload(
            {
                "meta": {"city": "Warsaw", "kind": "hotels", "language": "en"},
                "hotels": [],
            }
        )

    def test_missing_meta_raises(self):
        with pytest.raises(ValueError, match="meta must be an object"):
            validate_hotel_payload({"hotels": []})

    def test_error_message_contains_field_path(self):
        with pytest.raises(ValueError, match=r"hotels\.0\.name"):
            validate_hotel_payload(
                {
                    "meta": {"city": "Warsaw", "kind": "hotels", "language": "en"},
                    "hotels": [{"url": "https://example.com"}],
                }
            )

    def test_non_dict_payload_raises(self):
        with pytest.raises(ValueError, match="must be an object"):
            validate_hotel_payload(["not", "a", "dict"])

    def test_returns_sanitized_copy(self):
        result = validate_hotel_payload(
            {
                "meta": {"city": "Warsaw", "kind": "hotels", "language": "en"},
                "hotels": [{"name": "H", "url": "javascript:alert(1)", "rating": 42}],
            }
        )
        assert result["hotels"][0]["url"] == ""
        assert result["hotels"][0]["rating"] is None


class TestWeatherPayload:
    def test_valid_current_payload(self):
        validate_weather_payload(
            {
                "meta": {
                    "city": "Warsaw",
                    "kind": "current",
                    "date": "2026-08-08",
                    "language": "en",
                },
                "current": CURRENT_WEATHER,
            }
        )

    def test_valid_forecast_payload(self):
        validate_weather_payload(
            {
                "meta": {
                    "city": "Warsaw",
                    "kind": "forecast",
                    "date_range": "2026-08-08..2026-08-10",
                    "language": "en",
                },
                "days": [DAY_WEATHER],
            }
        )

    def test_missing_field_reports_path(self):
        current = dict(CURRENT_WEATHER)
        del current["sunrise"]
        with pytest.raises(ValueError, match=r"current\.sunrise"):
            validate_weather_payload(
                {
                    "meta": {
                        "city": "Warsaw",
                        "kind": "current",
                        "date": "2026-08-08",
                        "language": "en",
                    },
                    "current": current,
                }
            )

    def test_unknown_kind_raises(self):
        with pytest.raises(ValueError, match="meta.kind must be one of"):
            validate_weather_payload(
                {"meta": {"city": "Warsaw", "kind": "hotels", "language": "en"}}
            )

    @pytest.mark.parametrize("field", ["sunrise", "sunset", "pressure", "winddir"])
    @pytest.mark.parametrize("value", [None, "", "  "])
    def test_absent_value_becomes_null(self, field, value):
        # e.g. no sunrise during polar night: the rest of the reply still counts.
        result = validate_weather_payload(
            {
                "meta": {
                    "city": "Longyearbyen",
                    "kind": "forecast",
                    "date_range": "2026-11-21..2026-11-21",
                    "language": "en",
                },
                "days": [DAY_WEATHER | {field: value}],
            }
        )
        assert result["days"][0][field] is None

    def test_malformed_time_is_still_rejected(self):
        with pytest.raises(ValueError, match=r"current\.sunrise"):
            validate_weather_payload(
                {
                    "meta": {
                        "city": "Warsaw",
                        "kind": "current",
                        "date": "2026-08-08",
                        "language": "en",
                    },
                    "current": CURRENT_WEATHER | {"sunrise": "morning"},
                }
            )


class TestCombinedPayload:
    def test_valid_combined_payload(self):
        validate_combined_payload(
            {
                "meta": {
                    "city": "Warsaw",
                    "kind": "combined",
                    "date": "2026-08-08",
                    "language": "en",
                },
                "weather": {"kind": "current", "current": CURRENT_WEATHER},
                "hotels": [],
            }
        )

    def test_returns_sanitized_weather_and_hotels(self):
        result = validate_combined_payload(
            {
                "meta": {
                    "city": "Warsaw",
                    "kind": "combined",
                    "date": "2026-08-08",
                    "language": "en",
                },
                "weather": {
                    "kind": "current",
                    "current": CURRENT_WEATHER | {"sunrise": ""},
                },
                "hotels": [{"name": "H", "url": "javascript:alert(1)"}],
            }
        )
        assert result["weather"]["current"]["sunrise"] is None
        assert result["hotels"][0]["url"] == ""

    def test_missing_weather_object_raises(self):
        with pytest.raises(ValueError, match="weather must be an object"):
            validate_combined_payload(
                {
                    "meta": {"city": "Warsaw", "kind": "combined", "language": "en"},
                    "hotels": [],
                }
            )

    def test_invalid_day_reports_path(self):
        day = dict(DAY_WEATHER)
        day["datetime"] = "08-08-2026"
        with pytest.raises(ValueError, match=r"days\.0\.datetime"):
            validate_combined_payload(
                {
                    "meta": {
                        "city": "Warsaw",
                        "kind": "combined",
                        "date_range": "2026-08-08..2026-08-10",
                        "language": "en",
                    },
                    "weather": {"kind": "forecast", "days": [day]},
                    "hotels": [],
                }
            )
