from __future__ import annotations

from typing import Optional

import click

from .app import create_app
from .config import get_settings
from .logging_config import configure_logging
from .middlewares import (
    RequestIDMiddleware,
    MetricsMiddleware,
    AuthTokenMiddleware,
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
)


@click.group()
def cli() -> None:
    """MCP server CLI."""


@cli.command("stdio")
def run_stdio_cmd() -> None:
    """Run server in stdio mode."""
    configure_logging()
    app = create_app()
    app.run(transport="stdio")


@cli.command("sse")
@click.option("--host", default=None, help="Bind host")
@click.option("--port", type=int, default=None, help="Bind port")
@click.option("--path", default="/sse", help="SSE endpoint path")
@click.option("--cors", default=None, help="Comma-separated CORS origins (e.g., http://x,https://y)")
def run_sse_cmd(host: Optional[str], port: Optional[int], path: str, cors: Optional[str]) -> None:
    """Run server in SSE mode with optional token auth and CORS."""
    configure_logging()
    settings = get_settings()
    app = create_app()
    # Build middleware list
    from starlette.middleware import Middleware
    from starlette.middleware.cors import CORSMiddleware

    middleware_list = [
        Middleware(RequestIDMiddleware),
        Middleware(MetricsMiddleware),
        Middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_rpm),
    ]

    if settings.auth_token:
        middleware_list.append(Middleware(AuthTokenMiddleware, token=settings.auth_token))

    cors_origins = cors or settings.cors_origins
    if cors_origins and cors_origins != "*":
        origins = [o.strip() for o in cors_origins.split(",") if o.strip()]
        middleware_list.append(
            Middleware(
                CORSMiddleware,
                allow_origins=origins,
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
                expose_headers=["*"],
            )
        )

    if settings.enable_security_headers:
        middleware_list.append(
            Middleware(
                SecurityHeadersMiddleware,
                csp=settings.content_security_policy,
            )
        )

    app.run(
        transport="sse",
        host=host or settings.host,
        port=port or settings.port,
        path=path,
        middleware=middleware_list or None,
    )


@cli.command("health")
def health_check() -> None:
    from .health import healthz, readyz

    import json

    print(json.dumps({"healthz": healthz(), "readyz": readyz()}))


def run_stdio() -> None:  # entry point alias
    run_stdio_cmd()


def run_sse() -> None:  # entry point alias
    run_sse_cmd(None, None, "/sse", None)


if __name__ == "__main__":
    cli()


