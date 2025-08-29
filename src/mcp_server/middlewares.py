from __future__ import annotations

import time
import uuid
from typing import Callable, Awaitable

from prometheus_client import Counter, Histogram
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, PlainTextResponse
from starlette.types import Message
import threading
import jwt
from rag.settings import get_rag_settings



HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)

HTTP_LATENCY = Histogram(
    "http_request_latency_seconds",
    "HTTP request latency in seconds",
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:  # noqa: E501
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:  # noqa: E501
        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start
        path = request.url.path
        method = request.method
        status = str(response.status_code)
        HTTP_REQUESTS.labels(method=method, path=path, status=status).inc()
        HTTP_LATENCY.observe(duration)
        return response


class AuthTokenMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, token: str):
        super().__init__(app)
        self._token = token

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:  # noqa: E501
        # Allow health and metrics unauthenticated for k8s scraping unless you want to protect them too
        if request.url.path in {"/healthz", "/readyz", "/metrics"}:
            return await call_next(request)

        auth = request.headers.get("authorization", "")
        if not auth.startswith("Bearer ") or auth.split(" ", 1)[1] != self._token:
            return PlainTextResponse("Unauthorized", status_code=401)

        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        *,
        hsts: str = "max-age=63072000; includeSubDomains; preload",
        content_type_options: str = "nosniff",
        referrer_policy: str = "no-referrer",
        frame_options: str = "DENY",
        csp: str | None = None,
    ):
        super().__init__(app)
        self._hsts = hsts
        self._content_type_options = content_type_options
        self._referrer_policy = referrer_policy
        self._frame_options = frame_options
        self._csp = csp

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:  # noqa: E501
        response = await call_next(request)
        response.headers.setdefault("Strict-Transport-Security", self._hsts)
        response.headers.setdefault("X-Content-Type-Options", self._content_type_options)
        response.headers.setdefault("Referrer-Policy", self._referrer_policy)
        response.headers.setdefault("X-Frame-Options", self._frame_options)
        if self._csp:
            response.headers.setdefault("Content-Security-Policy", self._csp)
        return response


class JWTAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._settings = get_rag_settings()

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:  # noqa: E501
        if request.url.path in {"/healthz", "/readyz", "/metrics"}:
            return await call_next(request)
        if request.url.path.startswith("/rag/"):
            if self._settings.allow_anonymous:
                return await call_next(request)
            auth = request.headers.get("authorization", "")
            if not auth.startswith("Bearer "):
                return PlainTextResponse("Unauthorized", status_code=401)
            token = auth.split(" ", 1)[1]
            try:
                jwt.decode(token, self._settings.jwt_secret, algorithms=[self._settings.jwt_alg])
            except Exception:  # noqa: BLE001
                return PlainTextResponse("Unauthorized", status_code=401)
        return await call_next(request)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Naive in-memory rate limiter keyed by client IP.

    For multi-instance deployments, use your ingress/proxy for rate limiting.
    """

    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self._limit = max(1, requests_per_minute)
        self._counts: dict[str, tuple[int, float]] = {}
        self._lock = threading.Lock()

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:  # noqa: E501
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        with self._lock:
            count, start = self._counts.get(client_ip, (0, now))
            if now - start >= 60:
                count, start = 0, now
            count += 1
            self._counts[client_ip] = (count, start)
            if count > self._limit:
                return PlainTextResponse("Too Many Requests", status_code=429)
        return await call_next(request)


