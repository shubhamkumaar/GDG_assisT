from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Awesome API"
    MISTRAL_API_KEY: str
    GENAI_API_KEY: str
    CLOUDINARY_URL: str
    model_config = SettingsConfigDict(env_file=".env")