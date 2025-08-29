from __future__ import annotations

from typing import List

from .retriever import retrieve_similar
from .openai_utils import generate_answer


def answer_question(question: str, fallback: bool = True) -> dict:
    contexts = retrieve_similar(question, top_k=6)
    context_text = "\n\n".join(t for t, _, _ in contexts)

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

    answer = generate_answer(prompt)
    citations = []
    for _, score, meta in contexts:
        citations.append({"chunk_id": meta.get("chunk_id"), "score": score})
    return {"answer": answer, "citations": citations}


