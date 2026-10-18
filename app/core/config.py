from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str
    WIDGET_ALLOWED_ORIGINS: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"  # Prevents crashes if extra env variables are present


settings = Settings()