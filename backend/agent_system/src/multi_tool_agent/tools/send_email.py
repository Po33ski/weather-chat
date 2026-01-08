import os
import json
import smtplib
from email.message import EmailMessage


# SMTP configuration loaded from environment variables
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)


def send_email(email: str, title: str, text: str) -> str:
    """
    Send an email using SMTP.

    Args:
        email: Recipient email address.
        title: Email subject.
        text: Email body (plain text).

    Returns:
        JSON string with the result, e.g.:
        {
            "success": true,
            "message": "Email sent successfully."
        }
        or
        {
            "success": false,
            "error": "Error message..."
        }
    """
    # Basic input validation
    if not email:
        return json.dumps({"success": False, "error": "No recipient email provided."})
    if not title:
        return json.dumps({"success": False, "error": "No email title provided."})
    if not text:
        return json.dumps({"success": False, "error": "No email text provided."})

    # Validate SMTP configuration
    if not SMTP_HOST:
        return json.dumps({"success": False, "error": "SMTP_HOST not configured."})
    if not SMTP_FROM_EMAIL:
        return json.dumps({"success": False, "error": "SMTP_FROM_EMAIL or SMTP_USER not configured."})

    msg = EmailMessage()
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = email
    msg["Subject"] = title
    msg.set_content(text)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            # Use STARTTLS by default (common for port 587)
            try:
                server.starttls()
            except Exception:
                # If STARTTLS is not supported, continue without it
                pass

            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)

            server.send_message(msg)

        return json.dumps({"success": True, "message": "Email sent successfully."})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

