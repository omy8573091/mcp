from __future__ import annotations

from prometheus_client import Counter, Histogram

MCP_REQUESTS = Counter(
    "mcp_requests_total",
    "Total number of MCP requests",
    ["method", "status"],
)

MCP_REQUEST_LATENCY = Histogram(
    "mcp_request_latency_seconds",
    "Latency of MCP requests in seconds",
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)


