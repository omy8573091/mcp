from __future__ import annotations

import os
from functools import lru_cache
from pydantic import BaseModel, Field


class RAGSettings(BaseModel):
    jwt_secret: str = Field(default_factory=lambda: os.getenv("RAG_JWT_SECRET", ""))
    jwt_alg: str = Field(default_factory=lambda: os.getenv("RAG_JWT_ALG", "HS256"))
    allow_anonymous: bool = Field(default_factory=lambda: os.getenv("RAG_ALLOW_ANON", "0") == "1")

    bm25_enable: bool = Field(default_factory=lambda: os.getenv("RAG_BM25", "1") == "1")
    rerank_top_k: int = Field(default_factory=lambda: int(os.getenv("RAG_RERANK_TOP_K", "10")))
    vector_top_k: int = Field(default_factory=lambda: int(os.getenv("RAG_VECTOR_TOP_K", "12")))

    embed_cache_enable: bool = Field(default_factory=lambda: os.getenv("RAG_EMBED_CACHE", "1") == "1")

    # Async ingestion
    async_ingest: bool = Field(default_factory=lambda: os.getenv("RAG_ASYNC_INGEST", "0") == "1")
    redis_url: str = Field(default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379/0"))


@lru_cache(maxsize=1)
def get_rag_settings() -> RAGSettings:
    return RAGSettings()


