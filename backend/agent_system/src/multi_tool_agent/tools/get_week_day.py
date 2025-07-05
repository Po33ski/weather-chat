from datetime import datetime


def get_week_day() -> str:
    """
    Get the week day from the date.
    """
    date = datetime.now()
    return date.strftime("%A")