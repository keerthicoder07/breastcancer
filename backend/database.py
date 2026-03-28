from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load .env from the backend/ folder regardless of where uvicorn is launched from
load_dotenv(dotenv_path=Path(__file__).parent / ".env")



def _build_db_url() -> str:
    """
    Build the asyncpg DATABASE_URL safely.
    Reads individual components so the password is URL-encoded,
    handling special characters like @ that would break a raw connection string.
    Falls back to DATABASE_URL env var if individual parts are not set.
    """
    user     = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    host     = os.getenv("DB_HOST", "localhost")
    port     = os.getenv("DB_PORT", "5432")
    dbname   = os.getenv("DB_NAME", "mammai")

    # If a full URL is provided explicitly, use it as-is (user's responsibility)
    explicit = os.getenv("DATABASE_URL")
    if explicit and not explicit.startswith("USE_COMPONENTS"):
        return explicit

    # Build URL with percent-encoded password (@ → %40, etc.)
    encoded_pw = quote_plus(password)
    return f"postgresql+asyncpg://{user}:{encoded_pw}@{host}:{port}/{dbname}"

DATABASE_URL = _build_db_url()

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    """Create all tables on startup (idempotent)."""
    from backend.models import User, Patient, Scan, Report  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
