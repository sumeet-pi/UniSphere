"""UniSphere Backend — Application configuration via environment variables."""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """All configuration is read from environment variables / .env file."""

    # Database
    DATABASE_URL: str = Field(
        ...,
        description="Neon PostgreSQL connection string",
    )

    # JWT
    SECRET_KEY: str = Field(
        ...,
        description="Secret key for JWT signing",
    )
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # Application
    APP_ENV: str = Field(default="development")
    FRONTEND_URL: str = Field(default="http://localhost:5173")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton — imported throughout the application
settings = Settings()
