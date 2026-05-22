import smtplib
from email.message import EmailMessage

from core.config import settings


def send_otp_email(to_email: str, otp: str, user_type: str, expires_minutes: int) -> None:
    if not settings.smtp_host or not settings.smtp_from_email:
        raise ValueError("SMTP settings are not configured")

    msg = EmailMessage()
    msg["Subject"] = f"{settings.app_name} - Email Verification OTP"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email

    msg.set_content(
        "Your verification code is: {otp}\n\n"
        "Account type: {user_type}\n"
        "This code expires in {expires_minutes} minutes.\n"
        "If you did not request this, please ignore this email.\n"
        .format(otp=otp, user_type=user_type.title(), expires_minutes=expires_minutes)
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(msg)
