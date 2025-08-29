from __future__ import annotations

import json
from pathlib import Path

import click

from .ingest import ingest_file
from .agent import answer_question
from .db import db_session
from .models import Document


@click.group()
def rag() -> None:
    """RAG utilities."""


@rag.command("ingest")
@click.argument("paths", nargs=-1, type=click.Path(exists=True, path_type=Path))
def ingest_cmd(paths: list[Path]) -> None:
    ids: list[int] = []
    for p in paths:
        if p.is_dir():
            for fp in p.rglob("*"):
                if fp.is_file():
                    ids.append(ingest_file(fp.name, fp.read_bytes()))
        else:
            ids.append(ingest_file(p.name, p.read_bytes()))
    click.echo(json.dumps({"document_ids": ids}))


@rag.command("ask")
@click.argument("question")
def ask_cmd(question: str) -> None:
    ans = answer_question(question)
    click.echo(ans)


@rag.command("list-docs")
def list_docs_cmd() -> None:
    with db_session() as s:
        rows = s.query(Document).all()
        items = [{"id": d.id, "filename": d.filename, "content_type": d.content_type} for d in rows]
        click.echo(json.dumps(items))


@rag.command("delete-doc")
@click.argument("doc_id", type=int)
def delete_doc_cmd(doc_id: int) -> None:
    from sqlalchemy import delete
    from .models import Chunk
    with db_session() as s:
        s.execute(delete(Chunk).where(Chunk.document_id == doc_id))
        s.execute(delete(Document).where(Document.id == doc_id))
        click.echo(json.dumps({"deleted": doc_id}))


def main() -> None:
    rag()


if __name__ == "__main__":
    main()


