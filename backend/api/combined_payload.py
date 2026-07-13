from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from .weather_payload import CurrentWeather, DateRangeStr, DateStr, DayWeather
from .hotel_payload import Hotel


class CombinedMeta(BaseModel):
    city: Annotated[str, Field(min_length=1)]
    kind: Literal["combined"]
    date: DateStr | None = None
    date_range: DateRangeStr | None = None
    language: Annotated[str, Field(min_length=1)]

    model_config = ConfigDict(extra="allow")


class CombinedWeatherCurrent(BaseModel):
    kind: Literal["current"]
    current: CurrentWeather

    model_config = ConfigDict(extra="allow")


class CombinedWeatherDays(BaseModel):
    kind: Literal["forecast", "history"]
    days: Annotated[list[DayWeather], Field(min_length=1)]

    model_config = ConfigDict(extra="allow")


class CombinedPayload(BaseModel):
    meta: CombinedMeta
    # Empty is a legitimate outcome (genuinely no hotels found) — the
    # frontend renders a "no hotels found" message for it. Do not require
    # min_length=1, or the agent gets pressured into fabricating an entry.
    hotels: list[Hotel] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")


def _format_validation_error(exc: ValidationError) -> str:
    errors = exc.errors(include_url=False)
    if not errors:
        return "Invalid combined-json payload"
    first = errors[0]
    loc = ".".join(str(p) for p in first.get("loc", ()))
    msg = first.get("msg", "Invalid value")
    return f"{loc}: {msg}" if loc else str(msg)


def validate_combined_payload(payload: Any) -> None:
    """
    Validate agent combined payload against the combined-json schema
    documented in `agent_system/src/multi_tool_agent/templates/json_format.py`.

    Raises:
        ValueError: if payload is invalid.
    """
    if not isinstance(payload, dict):
        raise ValueError("combined-json must be an object")

    meta = payload.get("meta")
    if not isinstance(meta, dict):
        raise ValueError("meta must be an object")

    weather = payload.get("weather")
    if not isinstance(weather, dict):
        raise ValueError("weather must be an object")

    weather_kind = weather.get("kind")
    try:
        if weather_kind == "current":
            CombinedWeatherCurrent.model_validate(weather)
        elif weather_kind in ("forecast", "history"):
            CombinedWeatherDays.model_validate(weather)
        else:
            raise ValueError('weather.kind must be one of: "current", "forecast", "history"')

        CombinedPayload.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(_format_validation_error(exc)) from exc
