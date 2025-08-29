from __future__ import annotations

import os

import pytest

from mcp_client.client import MCPClient


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("MCP_CLIENT_TRANSPORT", "sse")
    monkeypatch.setenv("MCP_SSE_URL", "http://localhost:8000/sse")


def test_client_instantiation():
    client = MCPClient()
    assert client is not None


