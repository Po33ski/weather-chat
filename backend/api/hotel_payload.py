from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class HotelMeta(BaseModel):
    city: Annotated[str, Field(min_length=1)]
    kind: Literal["hotels"]
    date: None = None
    date_range: str | None = None
    language: Annotated[str, Field(min_length=1)]

    model_config = ConfigDict(extra="allow")


class Hotel(BaseModel):
    name: Annotated[str, Field(min_length=1)]
    price_per_night: str = ""
    currency: str = ""
    availability: Literal["available", "unknown"] = "unknown"
    rating: float | None = None
    reviews_count: int | None = None
    highlights: list[str] = Field(default_factory=list)
    url: str = ""

    model_config = ConfigDict(extra="allow")

    # These fields are assembled by the LLM from untrusted web-search content,
    # and there is no retry loop back to the agent — a hard rejection here
    # would surface as an error for an otherwise fine reply. So out-of-contract
    # values are sanitized to their "unknown" form instead of rejected; the
    # frontend already renders "" / null / "unknown" as missing data.

    @field_validator("url")
    @classmethod
    def _url_must_be_http(cls, value: str) -> str:
        # The frontend renders this as a live <a href> link; anything but
        # http(s) (e.g. a javascript: URI) must not become clickable.
        value = (value or "").strip()
        if value and not value.startswith(("http://", "https://")):
            return ""
        return value

    @field_validator("availability", mode="before")
    @classmethod
    def _normalize_availability(cls, value: object) -> str:
        if isinstance(value, str) and value.strip().lower() == "available":
            return "available"
        return "unknown"

    @field_validator("rating")
    @classmethod
    def _rating_on_ten_scale(cls, value: float | None) -> float | None:
        if value is None or not (0 <= value <= 10):
            return None
        return value


class HotelPayload(BaseModel):
    meta: HotelMeta
    # Empty is a legitimate outcome (genuinely no hotels found) — the
    # frontend renders a "no hotels found" message for it. Do not require
    # min_length=1, or the agent gets pressured into fabricating an entry.
    hotels: list[Hotel] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")


def _format_validation_error(exc: ValidationError) -> str:
    errors = exc.errors(include_url=False)
    if not errors:
        return "Invalid hotel-json payload"
    first = errors[0]
    loc = ".".join(str(p) for p in first.get("loc", ()))
    msg = first.get("msg", "Invalid value")
    return f"{loc}: {msg}" if loc else str(msg)


def validate_hotel_payload(payload: Any) -> None:
    """
    Validate agent hotel payload against the hotel-json schema.

    Raises:
        ValueError: if payload is invalid.
    """
    if not isinstance(payload, dict):
        raise ValueError("hotel-json must be an object")

    meta = payload.get("meta")
    if not isinstance(meta, dict):
        raise ValueError("meta must be an object")

    try:
        HotelPayload.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(_format_validation_error(exc)) from exc
