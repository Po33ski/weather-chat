import os
from datetime import datetime
from zoneinfo import ZoneInfo


def get_date() -> str:
    """
    Get the current date and week day.
    The date will be in the format of YYYY-MM-DD.
    """
    tz_name = os.getenv("APP_TIMEZONE", "UTC")
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")
    date = datetime.now(tz)
    return date.strftime("%Y-%m-%d")


