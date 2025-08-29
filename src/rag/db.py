from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def _build_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        host = os.getenv("PGHOST", "localhost")
        port = os.getenv("PGPORT", "5432")
        user = os.getenv("PGUSER", "postgres")
        password = os.getenv("PGPASSWORD", "postgres")
        db = os.getenv("PGDATABASE", "mcp")
        url = f"postgresql+psycopg://{user}:{password}@{host}:{port}/{db}"
    return url


ENGINE = create_engine(_build_db_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=ENGINE, autoflush=False, autocommit=False)


@contextmanager
def db_session() -> Iterator["Session"]:
    from sqlalchemy.orm import Session  # local import for typing

    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:  # noqa: BLE001
        session.rollback()
        raise
    finally:
        session.close()


