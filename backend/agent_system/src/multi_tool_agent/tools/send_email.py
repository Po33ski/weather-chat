import os
import smtplib
from email.message import EmailMessage
from typing import Dict, Any


def send_email(email: str, title: str, text: str) -> Dict[str, Any]:
    """
    Send an email using SMTP.

    Args:
        email: Recipient email address.
        title: Email subject.
        text: Email body (plain text).

    Returns:
        {"success": True, "message": "Email sent successfully."} on success,
        or {"error": "message"} on failure.
    """
    if not email:
        return {"error": "No recipient email provided."}
    if not title:
        return {"error": "No email title provided."}
    if not text:
        return {"error": "No email text provided."}

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port_str = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL") or smtp_user

    if not smtp_host:
        return {"error": "Email service is not configured (SMTP_HOST missing)."}
    if not smtp_from_email:
        return {"error": "Email sender address is not configured (SMTP_FROM_EMAIL or SMTP_USER missing)."}

    try:
        smtp_port = int(smtp_port_str)
    except ValueError:
        return {"error": f"Email service has invalid port configuration: '{smtp_port_str}'."}

    msg = EmailMessage()
    msg["From"] = smtp_from_email
    msg["To"] = email
    msg["Subject"] = title
    msg.set_content(text)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            try:
                server.starttls()
            except smtplib.SMTPException:
                pass  # Server does not support STARTTLS; continue without encryption

            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)

            server.send_message(msg)

        return {"success": True, "message": "Email sent successfully."}
    except smtplib.SMTPAuthenticationError:
        return {"error": "Email authentication failed. Check SMTP credentials."}
    except smtplib.SMTPException as e:
        return {"error": f"Failed to send email: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error while sending email: {str(e)}"}
