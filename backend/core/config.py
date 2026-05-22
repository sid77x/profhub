from pydantic_settings import BaseSettings


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
