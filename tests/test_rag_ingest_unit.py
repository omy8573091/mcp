from __future__ import annotations

from rag import ingest as rag_ingest


def test_chunk_text_basic():
    text = "A" * 2500
    chunks = rag_ingest._chunk_text(text, max_chars=1000, overlap=100)
    # Expect 3 chunks: 0-1000, 900-1900, 1800-2500
    assert len(chunks) == 3
    assert len(chunks[0]) == 1000
    assert chunks[0].endswith("A")


