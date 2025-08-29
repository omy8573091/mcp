from __future__ import annotations

from typing import List

from fastmcp import FastMCP
from starlette.responses import JSONResponse
from starlette.requests import Request
from pydantic import BaseModel, Field

from .ingest import ingest_file
from .agent import answer_question
from .settings import get_rag_settings
from mcp_server.logging_config import get_logger
from .worker import enqueue_ingest
from sqlalchemy import text as sql_text
from .db import db_session


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


def register_rag_routes(app: FastMCP) -> None:
    logger = get_logger(__name__)
    @app.custom_route("/rag/upload", methods=["POST"])
    async def upload(request: Request):
        form = await request.form()
        files = form.getlist("files")  # type: ignore[assignment]
        ids: List[int] = []
        job_ids: List[str] = []
        for file in files:
            content = await file.read()  # type: ignore[attr-defined]
            if get_rag_settings().async_ingest:
                job_ids.append(enqueue_ingest(file.filename, content))  # type: ignore[attr-defined]
            else:
                ids.append(ingest_file(file.filename, content))  # type: ignore[attr-defined]
        logger.info("rag_upload", count=len(ids) + len(job_ids))
        return JSONResponse({"document_ids": ids, "jobs": job_ids})

    @app.custom_route("/rag/query", methods=["POST"])
    async def query(request: Request):
        data = await request.json()
        try:
            payload = QueryRequest(**data)
        except Exception as exc:  # noqa: BLE001
            return JSONResponse({"error": str(exc)}, status_code=400)
        result = answer_question(payload.question)
        logger.info("rag_query", q_len=len(payload.question))
        return JSONResponse(result)

    @app.custom_route("/rag/chunk/{chunk_id}", methods=["GET"])
    async def get_chunk(request: Request):
        try:
            chunk_id = int(request.path_params.get("chunk_id"))
        except Exception:  # noqa: BLE001
            return JSONResponse({"error": "invalid chunk_id"}, status_code=400)
        with db_session() as s:
            sql = sql_text("SELECT id, document_id, ordinal, start_char, end_char, text FROM chunks WHERE id = :id")
            row = s.execute(sql, {"id": chunk_id}).fetchone()
            if not row:
                return JSONResponse({"error": "not found"}, status_code=404)
            return JSONResponse({
                "id": int(row[0]),
                "document_id": int(row[1]),
                "ordinal": int(row[2]),
                "start_char": int(row[3]) if row[3] is not None else None,
                "end_char": int(row[4]) if row[4] is not None else None,
                "text": str(row[5]),
            })


