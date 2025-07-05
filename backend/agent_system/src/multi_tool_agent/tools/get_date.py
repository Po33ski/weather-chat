from datetime import datetime


def get_date() -> str:
    """
    Get the current date and week day.
    The date will be in the format of YYYY-MM-DD.
    """
    date = datetime.now()
    return date.strftime("%Y-%m-%d")


