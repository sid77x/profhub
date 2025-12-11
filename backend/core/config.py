from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Research Gig Platform - Professor Module"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "profhub"
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"


settings = Settings()
