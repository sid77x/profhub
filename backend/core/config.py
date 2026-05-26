from pydantic_settings import BaseSettings
import re


class Settings(BaseSettings):
    app_name: str = "Research Gig Platform - Professor Module"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "profhub"
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_from_email: str = ""
    smtp_from_name: str = "ResearchConnect"
    otp_expiry_minutes: int = 5
    otp_max_attempts: int = 5
    
    class Config:
        env_file = ".env"


settings = Settings()


def validate_professor_email(email: str) -> bool:
    """Validate professor email ends with @manipal.edu"""
    return email.lower().endswith("@manipal.edu")


def validate_student_email(email: str) -> bool:
    """Validate student email format: [xyz].mitmpl202[x]@learner.manipal.edu"""
    pattern = r"^[a-zA-Z0-9]+\.mitmpl202\d@learner\.manipal\.edu$"
    return bool(re.match(pattern, email.lower()))
