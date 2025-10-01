import os
from datetime import datetime
from zoneinfo import ZoneInfo


def get_week_day() -> str:
    """
    Get the week day from the date.
    """
    tz_name = os.getenv("APP_TIMEZONE", "UTC")
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")
    date = datetime.now(tz)
    return date.strftime("%A")