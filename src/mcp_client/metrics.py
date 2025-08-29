from __future__ import annotations

from prometheus_client import Counter, Histogram


MCP_CLIENT_REQUESTS = Counter(
    "mcp_client_requests_total",
    "Total number of MCP client requests",
    ["operation", "status"],
)

MCP_CLIENT_LATENCY = Histogram(
    "mcp_client_request_latency_seconds",
    "Latency of MCP client requests in seconds",
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)


