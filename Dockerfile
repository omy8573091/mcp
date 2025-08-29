FROM python:3.11-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md /app/
RUN pip wheel --no-cache-dir --wheel-dir /tmp/wheels .

COPY src /app/src
RUN pip install --no-cache-dir /tmp/wheels/*.whl && rm -rf /tmp/wheels

# Create non-root user
RUN useradd -u 10001 -m appuser
USER appuser

EXPOSE 8000

ENV HOST=0.0.0.0 PORT=8000 CORS_ORIGINS=* LOG_LEVEL=INFO ENABLE_METRICS=1

ENTRYPOINT ["mcp-server-sse"]

# RQ worker image (multi-stage)
FROM python:3.11-slim as worker
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
COPY pyproject.toml README.md /app/
RUN pip wheel --no-cache-dir --wheel-dir /tmp/wheels .
COPY src /app/src
RUN pip install --no-cache-dir /tmp/wheels/*.whl && rm -rf /tmp/wheels
USER 10001
ENTRYPOINT ["rq", "worker", "rag"]


