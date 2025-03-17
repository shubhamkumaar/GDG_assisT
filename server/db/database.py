from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from functools import lru_cache
from server import config

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:123456@localhost:5432/assist'

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
