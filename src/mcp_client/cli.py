from __future__ import annotations

from typing import Optional

import json
import click

from .client import MCPClient, MCPClientError
from .logging_config import configure_logging
import requests


@click.group()
def cli() -> None:
    """MCP client CLI."""


@cli.command("list-tools")
def list_tools_cmd() -> None:
    configure_logging()
    client = MCPClient()
    try:
        tools = client.list_tools()
    except MCPClientError as exc:
        raise click.ClickException(str(exc))
    click.echo(json.dumps(tools, indent=2))


@cli.command("call-tool")
@click.argument("name")
@click.option("--args", "args_json", default=None, help="JSON object of arguments")
def call_tool_cmd(name: str, args_json: Optional[str]) -> None:
    configure_logging()
    client = MCPClient()
    try:
        args = json.loads(args_json) if args_json else None
        result = client.call_tool(name, args)
    except json.JSONDecodeError as exc:
        raise click.ClickException(f"Invalid JSON for --args: {exc}")
    except MCPClientError as exc:
        raise click.ClickException(str(exc))
    click.echo(json.dumps(result, indent=2))


@cli.command("get-resource")
@click.argument("uri")
def get_resource_cmd(uri: str) -> None:
    configure_logging()
    client = MCPClient()
    try:
        result = client.get_resource(uri)
    except MCPClientError as exc:
        raise click.ClickException(str(exc))
    if isinstance(result, (dict, list)):
        click.echo(json.dumps(result, indent=2))
    else:
        click.echo(str(result))


@cli.command("rag-query")
@click.argument("question")
@click.option("--server", default=None, help="Base URL for server (default MCP_SSE_URL without /sse)")
@click.option("--auth", default=None, help="Bearer token for server (default AUTH_TOKEN)")
def rag_query_cmd(question: str, server: str | None, auth: str | None) -> None:
    """Query RAG endpoint and print answer with citations."""
    from mcp_client.config import get_client_settings

    settings = get_client_settings()
    base = server or settings.sse_url.rsplit("/", 1)[0]
    headers = {"Content-Type": "application/json"}
    token = auth or settings.sse_auth_token
    if token:
        headers["Authorization"] = f"Bearer {token}"
    resp = requests.post(f"{base}/rag/query", json={"question": question}, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    click.echo(data.get("answer", ""))
    cits = data.get("citations", [])
    if cits:
        click.echo("\nCitations:")
        for c in cits:
            cid = c.get("chunk_id")
            cresp = requests.get(f"{base}/rag/chunk/{cid}", headers=headers, timeout=30)
            if cresp.ok:
                meta = cresp.json()
                click.echo(f"- chunk #{cid} (doc {meta.get('document_id')} ord {meta.get('ordinal')})")


@cli.command("health")
def health_cmd() -> None:
    configure_logging()
    client = MCPClient()
    # For health we just try a lightweight call
    try:
        tools = client.list_tools()
        click.echo(json.dumps({"status": "ok", "tools_count": len(tools)}))
    except Exception as exc:  # noqa: BLE001
        raise click.ClickException(f"unhealthy: {exc}")


def main() -> None:  # entry point alias
    cli()


if __name__ == "__main__":
    main()


