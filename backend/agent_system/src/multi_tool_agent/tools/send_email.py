import os
import smtplib
from email.message import EmailMessage
from typing import Dict, Any

from .exceptions import ToolValidationError, ToolConfigurationError, ToolAPIError

# SMTP configuration loaded from environment variables
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)


def send_email(email: str, title: str, text: str) -> Dict[str, Any]:
    """
    Send an email using SMTP.

    Args:
        email: Recipient email address.
        title: Email subject.
        text: Email body (plain text).

    Returns:
        Dict with success message: {"success": True, "message": "Email sent successfully."}
    
    Raises:
        ToolValidationError: If email, title, or text is not provided
        ToolConfigurationError: If SMTP configuration is missing
        ToolAPIError: If email sending fails
    """
    # Basic input validation
    if not email:
        raise ToolValidationError("No recipient email provided.")
    if not title:
        raise ToolValidationError("No email title provided.")
    if not text:
        raise ToolValidationError("No email text provided.")

    # Validate SMTP configuration
    if not SMTP_HOST:
        raise ToolConfigurationError("SMTP_HOST not configured.")
    if not SMTP_FROM_EMAIL:
        raise ToolConfigurationError("SMTP_FROM_EMAIL or SMTP_USER not configured.")

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

        return {"success": True, "message": "Email sent successfully."}
    except smtplib.SMTPException as e:
        raise ToolAPIError(f"Failed to send email: {str(e)}") from e
    except Exception as e:
        raise ToolAPIError(f"Unexpected error while sending email: {str(e)}") from e

