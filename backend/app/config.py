from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Nastavitve aplikacije, prebrane iz datoteke .env."""

    database_url: str = "postgresql+psycopg://nasblok:nasblok@localhost:5432/nasblok"
    jwt_secret: str = "spremeni-me"
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
