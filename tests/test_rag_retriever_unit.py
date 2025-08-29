from __future__ import annotations

import pytest

from rag import retriever


def test_retrieve_similar_requires_openai_api(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        retriever.retrieve_similar("test")


