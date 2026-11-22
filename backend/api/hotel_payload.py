from __future__ import annotations

import math
import re
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

# "8.5", "8,5" or "8.5/10". Other scales ("4.5/5") can't be read as 0-10.
_RATING_PATTERN = re.compile(r"^(\d+(?:[.,]\d+)?)(?:\s*/\s*10)?$")
# "1234", "1,234", "1 234", "1.234": thousands separators vary by locale.
_COUNT_PATTERN = re.compile(r"^\d{1,3}(?:[ ,. ]\d{3}){1,3}$|^\d{1,12}$")


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

    @field_validator("url", mode="before")
    @classmethod
    def _url_must_be_http(cls, value: object) -> str:
        # The frontend renders this as a live <a href> link; anything but
        # http(s) (e.g. a javascript: URI) must not become clickable.
        text = value.strip() if isinstance(value, str) else ""
        if text and not text.startswith(("http://", "https://")):
            return ""
        return text

    @field_validator("currency", mode="before")
    @classmethod
    def _currency_as_text(cls, value: object) -> str:
        return value if isinstance(value, str) else ""

    @field_validator("price_per_night", mode="before")
    @classmethod
    def _price_as_text(cls, value: object) -> str:
        if isinstance(value, str):
            return value
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return ""
        if not math.isfinite(value):
            return ""
        return str(int(value)) if value == int(value) else str(value)

    @field_validator("availability", mode="before")
    @classmethod
    def _normalize_availability(cls, value: object) -> str:
        if isinstance(value, str) and value.strip().lower() == "available":
            return "available"
        return "unknown"

    @field_validator("rating", mode="before")
    @classmethod
    def _rating_on_ten_scale(cls, value: object) -> float | None:
        if isinstance(value, str):
            match = _RATING_PATTERN.match(value.strip())
            value = float(match.group(1).replace(",", ".")) if match else None
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return None
        return float(value) if 0 <= value <= 10 else None

    @field_validator("reviews_count", mode="before")
    @classmethod
    def _reviews_as_int(cls, value: object) -> int | None:
        if isinstance(value, str):
            text = value.strip()
            value = int(re.sub(r"\D", "", text)) if _COUNT_PATTERN.match(text) else None
        if isinstance(value, float) and value.is_integer():
            value = int(value)
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            return None
        return value

    @field_validator("highlights", mode="before")
    @classmethod
    def _text_highlights_only(cls, value: object) -> list[str]:
        if not isinstance(value, list):
            return []
        return [
            item.strip() for item in value if isinstance(item, str) and item.strip()
        ]


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


def validate_hotel_payload(payload: Any) -> dict[str, Any]:
    """
    Validate agent hotel payload against the hotel-json schema.

    Returns:
        The payload with out-of-contract hotel fields sanitized. Callers must
        send this copy to the client, not the original.

    Raises:
        ValueError: if payload is invalid.
    """
    if not isinstance(payload, dict):
        raise ValueError("hotel-json must be an object")

    meta = payload.get("meta")
    if not isinstance(meta, dict):
        raise ValueError("meta must be an object")

    try:
        return HotelPayload.model_validate(payload).model_dump(exclude_unset=True)
    except ValidationError as exc:
        raise ValueError(_format_validation_error(exc)) from exc
