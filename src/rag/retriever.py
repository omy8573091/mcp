from __future__ import annotations

from typing import List, Tuple

from sqlalchemy import text as sql_text

from .db import db_session
from .openai_utils import embed_texts
from .settings import get_rag_settings
from rank_bm25 import BM25Okapi


def retrieve_similar(query: str, top_k: int = 5) -> List[tuple[str, float, dict]]:
    settings = get_rag_settings()
    query_emb = embed_texts([query])[0]
    with db_session() as s:
        sql = sql_text(
            """
            SELECT id, text, 1 - (embedding <=> :query_embedding) AS score
            FROM chunks
            ORDER BY embedding <=> :query_embedding
            LIMIT :k
            """
        )
        rows = s.execute(sql, {"query_embedding": query_emb, "k": settings.vector_top_k}).fetchall()
        vector_results = [(int(r[0]), str(r[1]), float(r[2])) for r in rows]

        if settings.bm25_enable:
            texts = [t for _, t, _ in vector_results]
            corpus_tokens = [t.split() for t in texts]
            bm25 = BM25Okapi(corpus_tokens)
            scores = bm25.get_scores(query.split())
            reranked = sorted(
                zip(vector_results, scores), key=lambda x: (x[0][2] * 0.6 + float(x[1]) * 0.4), reverse=True
            )
            top = reranked[: settings.rerank_top_k]
            results = []
            for item in top[: top_k]:
                (chunk_id, text, score) = item[0]
                results.append((text, float(score), {"chunk_id": chunk_id}))
            return results
        return [(text, score, {"chunk_id": cid}) for (cid, text, score) in vector_results[:top_k]]


