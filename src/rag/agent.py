from __future__ import annotations

from typing import List

from opentelemetry import trace

from .retriever import retrieve_similar
from .openai_utils import generate_answer

tracer = trace.get_tracer(__name__)


def answer_question(question: str, fallback: bool = True) -> dict:
    with tracer.start_as_current_span("rag.answer_question") as span:
        span.set_attributes({
            "rag.question_length": len(question),
            "rag.fallback_enabled": fallback,
        })
        
        with tracer.start_as_current_span("rag.retrieve_context"):
            contexts = retrieve_similar(question, top_k=6)
            context_text = "\n\n".join(t for t, _, _ in contexts)
            span.set_attributes({
                "rag.context_count": len(contexts),
                "rag.context_length": len(context_text),
            })

        with tracer.start_as_current_span("rag.generate_answer"):
            prompt = (
                "System: You are Omprakash's production RAG assistant (Cursor MCP RAG Agent).\n"
                "- Use the provided context snippets when relevant.\n"
                "- Always include a short 'Suggestions' section with 2-4 actionable follow-ups the user may find helpful.\n"
                "- If context is weak or missing, still provide a safe, general best-practice answer.\n"
                "- Be concise, factual, and avoid speculation beyond reasonable best practices.\n\n"
                f"Context Snippets (may be partial):\n{context_text}\n\n"
                f"User Question: {question}\n\n"
                "Required Output Format:\n"
                "1) A direct answer paragraph.\n"
                "2) A 'Suggestions:' list with 2-4 bullets.\n"
            )
            
            span.set_attribute("rag.prompt_length", len(prompt))
            answer = generate_answer(prompt)
            span.set_attribute("rag.answer_length", len(answer))

        citations = []
        for _, score, meta in contexts:
            citations.append({"chunk_id": meta.get("chunk_id"), "score": score})
        
        span.set_attribute("rag.citations_count", len(citations))
        return {"answer": answer, "citations": citations}


