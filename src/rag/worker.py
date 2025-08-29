from __future__ import annotations

import json
from rq import Queue
from redis import Redis

from .settings import get_rag_settings
from .ingest import ingest_file


def get_queue() -> Queue:
    settings = get_rag_settings()
    redis = Redis.from_url(settings.redis_url)
    return Queue("rag", connection=redis, default_timeout=600)


def enqueue_ingest(filename: str, data: bytes, source_path: str | None = None) -> str:
    q = get_queue()
    job = q.enqueue(ingest_file, filename, data, source_path=source_path, retry=3)
    return job.get_id()


