from __future__ import annotations

import logging
import os
from typing import Any, Dict

import structlog


def _get_log_level() -> int:
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    return getattr(logging, level, logging.INFO)


def configure_logging() -> None:
    """Configure structured JSON logging for app and uvicorn."""
    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True)

    processors = [
        structlog.contextvars.merge_contextvars,
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.dict_tracebacks,
        structlog.processors.JSONRenderer(),
    ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(_get_log_level()),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(level=_get_log_level())


def get_logger(name: str) -> structlog.stdlib.BoundLogger:  # type: ignore[name-defined]
    return structlog.get_logger(name)


