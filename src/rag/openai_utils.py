from __future__ import annotations

import os
from typing import Iterable, List

from openai import OpenAI


def _client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)


def embed_texts(texts: Iterable[str], model: str = "text-embedding-3-small") -> List[List[float]]:
    client = _client()
    items = list(texts)
    if not items:
        return []
    resp = client.embeddings.create(model=model, input=items)
    return [d.embedding for d in resp.data]


def generate_answer(prompt: str, model: str = "gpt-4o-mini") -> str:
    client = _client()
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return resp.choices[0].message.content or ""


