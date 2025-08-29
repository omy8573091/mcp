from __future__ import annotations

import contextlib
import json
import subprocess
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

import requests

from .config import get_client_settings
from .logging_config import get_logger, configure_logging
from .metrics import MCP_CLIENT_REQUESTS, MCP_CLIENT_LATENCY


class MCPClientError(Exception):
    pass


class MCPClient:
    def __init__(self) -> None:
        self.settings = get_client_settings()
        configure_logging()
        self.logger = get_logger(__name__)

    # --- Transport-agnostic API ---
    def list_tools(self) -> List[Dict[str, Any]]:
        return self._perform("list_tools", None)

    def call_tool(self, name: str, args: Optional[Dict[str, Any]] = None) -> Any:
        payload = {"name": name, "args": args or {}}
        return self._perform("call_tool", payload)

    def get_resource(self, uri: str) -> Any:
        payload = {"uri": uri}
        return self._perform("get_resource", payload)

    # --- Internal helpers ---
    def _perform(self, operation: str, payload: Optional[Dict[str, Any]]) -> Any:
        start = time.perf_counter()
        status = "success"
        try:
            if self.settings.transport == "stdio":
                result = self._perform_stdio(operation, payload)
            elif self.settings.transport == "sse":
                result = self._perform_sse(operation, payload)
            else:
                raise MCPClientError(f"Unsupported transport: {self.settings.transport}")
            return result
        except Exception as exc:  # noqa: BLE001
            status = "error"
            self.logger.error("mcp_client_error", operation=operation, error=str(exc))
            raise
        finally:
            duration = time.perf_counter() - start
            MCP_CLIENT_REQUESTS.labels(operation=operation, status=status).inc()
            MCP_CLIENT_LATENCY.observe(duration)

    def _perform_sse(self, operation: str, payload: Optional[Dict[str, Any]]) -> Any:
        headers = {"Content-Type": "application/json"}
        if self.settings.sse_auth_token:
            headers["Authorization"] = f"Bearer {self.settings.sse_auth_token}"

        url = self.settings.sse_url.rstrip("/")
        if operation == "list_tools":
            endpoint = f"{url}/tools"
            method = "GET"
            data = None
        elif operation == "call_tool":
            endpoint = f"{url}/tools/call"
            method = "POST"
            data = json.dumps(payload or {})
        elif operation == "get_resource":
            endpoint = f"{url}/resources/get"
            method = "POST"
            data = json.dumps(payload or {})
        else:
            raise MCPClientError(f"Unknown operation for SSE: {operation}")

        timeout = self.settings.sse_timeout_seconds
        verify = self.settings.verify_tls
        with requests.Session() as session:
            if method == "GET":
                resp = session.get(endpoint, headers=headers, timeout=timeout, verify=verify)
            else:
                resp = session.post(endpoint, headers=headers, data=data, timeout=timeout, verify=verify)
        if resp.status_code >= 400:
            raise MCPClientError(f"HTTP {resp.status_code}: {resp.text}")
        return resp.json() if resp.headers.get("content-type", "").startswith("application/json") else resp.text

    def _perform_stdio(self, operation: str, payload: Optional[Dict[str, Any]]) -> Any:
        if not self.settings.stdio_command:
            raise MCPClientError("MCP_STDIO_COMMAND must be set for stdio transport")
        cmd = self.settings.stdio_command
        cwd = self.settings.stdio_cwd or None

        request_obj = {"operation": operation, "payload": payload or {}}
        data = json.dumps(request_obj).encode()
        with contextlib.ExitStack() as stack:
            proc = subprocess.Popen(
                cmd.split(),
                cwd=cwd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            assert proc.stdin is not None and proc.stdout is not None
            proc.stdin.write(data)
            proc.stdin.flush()
            stdout, stderr = proc.communicate(timeout=60)
            if proc.returncode != 0:
                raise MCPClientError(f"stdio command failed: {stderr.decode(errors='ignore')}")
        if not stdout:
            return None
        text = stdout.decode(errors="ignore").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text


