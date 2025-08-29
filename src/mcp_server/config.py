from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from pydantic import BaseModel, Field


class Settings(BaseModel):
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "production"))
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    # SSE server
    host: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    cors_origins: str = Field(default_factory=lambda: os.getenv("CORS_ORIGINS", "*"))
    auth_token: Optional[str] = Field(default_factory=lambda: os.getenv("AUTH_TOKEN"))

    # Metrics
    enable_metrics: bool = Field(default_factory=lambda: os.getenv("ENABLE_METRICS", "1") == "1")
    # Security headers
    enable_security_headers: bool = Field(default_factory=lambda: os.getenv("ENABLE_SECURITY_HEADERS", "1") == "1")
    content_security_policy: Optional[str] = Field(default_factory=lambda: os.getenv("CONTENT_SECURITY_POLICY"))
    # Rate limiting
    rate_limit_rpm: int = Field(default_factory=lambda: int(os.getenv("RATE_LIMIT_RPM", "120")))
    # Tracing
    otel_enable: bool = Field(default_factory=lambda: os.getenv("OTEL_ENABLE", "0") == "1")
    otel_service_name: Optional[str] = Field(default_factory=lambda: os.getenv("OTEL_SERVICE_NAME"))
    otel_exporter_otlp_endpoint: Optional[str] = Field(default_factory=lambda: os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT"))


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


