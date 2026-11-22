from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, ValidationError

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"
DATE_RANGE_PATTERN = r"^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$"
TIME_PATTERN = r"^\d{2}:\d{2}$"

DateStr = Annotated[str, Field(pattern=DATE_PATTERN)]
DateRangeStr = Annotated[str, Field(pattern=DATE_RANGE_PATTERN)]
TimeStr = Annotated[str, Field(pattern=TIME_PATTERN)]


def _blank_to_none(value: Any) -> Any:
    return None if isinstance(value, str) and not value.strip() else value


# The keys stay required, but a value can be genuinely absent (no sunrise during
# polar night, a station without a pressure reading). The frontend renders null
# as a dash, so one gap must not discard the whole reply. The prompt tells the
# model to use null; it is also told to use "" for unknown strings, hence the
# blank handling.
NullableFloat = Annotated[float | None, BeforeValidator(_blank_to_none)]
NullableText = Annotated[str | None, BeforeValidator(_blank_to_none)]
NullableTime = Annotated[TimeStr | None, BeforeValidator(_blank_to_none)]


class WeatherMetaBase(BaseModel):
    city: Annotated[str, Field(min_length=1)]
    kind: Literal["current", "forecast", "history"]
    language: Annotated[str, Field(min_length=1)]

    model_config = ConfigDict(extra="allow")


class WeatherMetaCurrent(WeatherMetaBase):
    kind: Literal["current"]
    date: DateStr
    date_range: None = None


class WeatherMetaRange(WeatherMetaBase):
    kind: Literal["forecast", "history"]
    date: None = None
    date_range: DateRangeStr


class CurrentWeather(BaseModel):
    temp: NullableFloat
    tempmax: NullableFloat
    tempmin: NullableFloat
    windspeed: NullableFloat
    winddir: NullableFloat
    pressure: NullableFloat
    humidity: NullableFloat
    sunrise: NullableTime
    sunset: NullableTime
    conditions: NullableText

    model_config = ConfigDict(extra="allow")


class DayWeather(CurrentWeather):
    datetime: DateStr


class WeatherCurrentPayload(BaseModel):
    meta: WeatherMetaCurrent
    current: CurrentWeather

    model_config = ConfigDict(extra="allow")


class WeatherDaysPayload(BaseModel):
    meta: WeatherMetaRange
    days: Annotated[list[DayWeather], Field(min_length=1)]

    model_config = ConfigDict(extra="allow")


def _format_validation_error(exc: ValidationError) -> str:
    errors = exc.errors(include_url=False)
    if not errors:
        return "Invalid weather-json payload"
    first = errors[0]
    loc = ".".join(str(p) for p in first.get("loc", ()))
    msg = first.get("msg", "Invalid value")
    return f"{loc}: {msg}" if loc else str(msg)


def validate_weather_payload(payload: Any) -> dict[str, Any]:
    """
    Validate agent weather payload against the schema documented in
    `agent_system/src/multi_tool_agent/templates/json_format.py`.

    Returns:
        The payload with blank values normalized to null.

    Raises:
        ValueError: if payload is invalid.
    """
    if not isinstance(payload, dict):
        raise ValueError("weather-json must be an object")

    meta = payload.get("meta")
    if not isinstance(meta, dict):
        raise ValueError("meta must be an object")

    kind = meta.get("kind")
    try:
        if kind == "current":
            model = WeatherCurrentPayload.model_validate(payload)
            return model.model_dump(exclude_unset=True)
        if kind in ("forecast", "history"):
            model = WeatherDaysPayload.model_validate(payload)
            return model.model_dump(exclude_unset=True)
    except ValidationError as exc:
        raise ValueError(_format_validation_error(exc)) from exc

    raise ValueError('meta.kind must be one of: "current", "forecast", "history"')
