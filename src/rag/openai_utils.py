from __future__ import annotations

import os
from typing import Iterable, List

from openai import OpenAI
from opentelemetry import trace

tracer = trace.get_tracer(__name__)


def _client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)


def embed_texts(texts: Iterable[str], model: str = "text-embedding-3-small") -> List[List[float]]:
    with tracer.start_as_current_span("openai.embed_texts") as span:
        client = _client()
        items = list(texts)
        if not items:
            return []
        
        span.set_attributes({
            "openai.model": model,
            "openai.input_count": len(items),
            "openai.input_tokens": sum(len(t.split()) for t in items),  # rough estimate
        })
        
        resp = client.embeddings.create(model=model, input=items)
        
        span.set_attributes({
            "openai.usage_tokens": resp.usage.total_tokens if resp.usage else 0,
            "openai.embedding_dimension": len(resp.data[0].embedding) if resp.data else 0,
        })
        
        return [d.embedding for d in resp.data]


def generate_answer(prompt: str, model: str = "gpt-4o-mini") -> str:
    with tracer.start_as_current_span("openai.generate_answer") as span:
        client = _client()
        
        span.set_attributes({
            "openai.model": model,
            "openai.prompt_length": len(prompt),
            "openai.temperature": 0.2,
        })
        
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        
        answer = resp.choices[0].message.content or ""
        
        span.set_attributes({
            "openai.answer_length": len(answer),
            "openai.usage_prompt_tokens": resp.usage.prompt_tokens if resp.usage else 0,
            "openai.usage_completion_tokens": resp.usage.completion_tokens if resp.usage else 0,
            "openai.usage_total_tokens": resp.usage.total_tokens if resp.usage else 0,
        })
        
        return answer


