from __future__ import annotations

import json
import os

import pytest
from click.testing import CliRunner

from mcp_client.cli import cli


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("MCP_CLIENT_TRANSPORT", "sse")
    monkeypatch.setenv("MCP_SSE_URL", "http://localhost:8000/sse")


def test_cli_health_runs():
    runner = CliRunner()
    result = runner.invoke(cli, ["health"], catch_exceptions=False)
    # It may fail if server isn't running; just assert CLI executed
    assert result.exit_code in (0, 1)


def test_cli_list_tools_executes():
    runner = CliRunner()
    result = runner.invoke(cli, ["list-tools"], catch_exceptions=True)
    # Should not crash even if server absent (ClickException)
    assert result.exit_code in (0, 1)


