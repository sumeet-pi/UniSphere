"""UniSphere Backend — Database session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings


def _build_engine_url(url: str) -> str:
    """Normalize the DATABASE_URL for SQLAlchemy + psycopg3.

    Neon provides `postgresql://...` URLs.  SQLAlchemy needs the driver
    specified in the scheme for psycopg3: `postgresql+psycopg://...`.
    """
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    # If already contains +psycopg, leave it alone
    return url


engine = create_engine(
    _build_engine_url(settings.DATABASE_URL),
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=settings.APP_ENV == "development",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a scoped session, closes on completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
