from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GDG AssisT"
    MISTRAL_API_KEY: str
    GENAI_API_KEY: str
    SQLALCHEMY_DATABASE_URL:str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    GOOGLE_APPLICATION_CREDENTIALS : str
    model_config = SettingsConfigDict(env_file="server/.env")