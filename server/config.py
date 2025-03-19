from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GDG AssisT"
    MISTRAL_API_KEY: str
    GENAI_API_KEY: str
    CLOUDINARY_URL: str
    SQLALCHEMY_DATABASE_URL:str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    model_config = SettingsConfigDict(env_file="server/.env")
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str


GOOGLE_REDIRECT_URI="http://localhost:8000/auth/google/callback"