from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError


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
    availability: str = "unknown"
    rating: float | None = None
    reviews_count: int | None = None
    highlights: list[str] = Field(default_factory=list)
    url: str = ""

    model_config = ConfigDict(extra="allow")


class HotelPayload(BaseModel):
    meta: HotelMeta
    hotels: Annotated[list[Hotel], Field(min_length=1)]

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
