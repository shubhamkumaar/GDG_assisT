from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GDG Assist"
    MISTRAL_API_KEY: str = "YOUR_MISTRAL_API_KEY"
    GENAI_API_KEY: str = "YOUR_GEMINI_API_KEY"
    CLOUDINARY_URL: str = "YOUR_CLOUDINARY_URL"

    model_config = SettingsConfigDict(env_file="server/.env")