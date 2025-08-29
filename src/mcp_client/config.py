from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from pydantic import BaseModel, Field


class ClientSettings(BaseModel):
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "production"))
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    # Transport selection: "stdio" or "sse"
    transport: str = Field(default_factory=lambda: os.getenv("MCP_CLIENT_TRANSPORT", "sse"))

    # For stdio transport (spawn a server command)
    stdio_command: Optional[str] = Field(default_factory=lambda: os.getenv("MCP_STDIO_COMMAND"))
    stdio_cwd: Optional[str] = Field(default_factory=lambda: os.getenv("MCP_STDIO_CWD"))

    # For SSE transport
    sse_url: str = Field(default_factory=lambda: os.getenv("MCP_SSE_URL", "http://localhost:8000/sse"))
    sse_auth_token: Optional[str] = Field(default_factory=lambda: os.getenv("AUTH_TOKEN"))
    sse_timeout_seconds: float = Field(default_factory=lambda: float(os.getenv("MCP_SSE_TIMEOUT", "30")))

    # TLS / verification
    verify_tls: bool = Field(default_factory=lambda: os.getenv("VERIFY_TLS", "1") == "1")

    # Metrics
    enable_metrics: bool = Field(default_factory=lambda: os.getenv("ENABLE_METRICS", "1") == "1")


@lru_cache(maxsize=1)
def get_client_settings() -> ClientSettings:
    return ClientSettings()


