from __future__ import annotations

from typing import List

from fastmcp import FastMCP


def register_tools(app: FastMCP) -> None:
    @app.tool()
    def ping() -> str:
        return "pong"

    @app.tool()
    def add(a: float, b: float) -> float:
        return a + b

    @app.tool()
    def rag_ask(question: str) -> str:
        from rag.agent import answer_question
        result = answer_question(question)
        return result.get("answer", "")


