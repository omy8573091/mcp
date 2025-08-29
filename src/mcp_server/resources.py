from __future__ import annotations

from typing import Iterator

from fastmcp import FastMCP


def register_resources(app: FastMCP) -> None:
    @app.resource("time://now")
    def current_time() -> str:
        import datetime as _dt

        return _dt.datetime.utcnow().isoformat() + "Z"


