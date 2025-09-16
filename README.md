## MCP Server (FastMCP) and Client

Production-ready [FastMCP] server and a production-grade client with structured logging, env config, health checks, metrics, and containerization.

### Features
- **Server**: Stdio and SSE runtimes via FastMCP, CORS & security headers, token auth, basic rate limiting
- **Client**: SSE and stdio transports, CLI to list tools/call tools/get resources, structured logs
- Structured JSON logging with `structlog`
- Env-based configuration
- Health endpoints and CLI checks
- Prometheus metrics primitives
- Dockerfile and Makefile

### Requirements
- Python 3.9+

### Setup
```bash
ls -la .venv
python3 -m venv .venv
.venv\Scripts\activate
 python -m pip install --upgrade pip
# . .venv/bin/activate   for linux
# pip install -U pip
pip install -e .[dev]
```

Copy and adjust environment:
```bash
cp .env.example .env || true
```

### Run (stdio)
```bash
mcp-server-stdio
```

### Run (SSE)
```bash
mcp-server-sse  # uses HOST, PORT, AUTH_TOKEN, CORS_ORIGINS
```

### Health
```bash
mcp-server-health
```

### Docker
```bash
docker build -t mcp-server:latest .
docker run --rm -p 8000:8000 -e AUTH_TOKEN=changeme mcp-server:latest
```

### Client CLI
Environment (SSE example):
```bash
export MCP_CLIENT_TRANSPORT=sse
export MCP_SSE_URL=http://localhost:8000/sse
export AUTH_TOKEN=changeme  # if server requires it
```

List tools:
```bash
mcpx list-tools
```

Call tool:
```bash
mcpx call-tool add --args '{"a": 1, "b": 2}'
```

Get resource:
```bash
mcpx get-resource time://now
```

Health check:
```bash
mcpx health
```

### Security
- Set a strong `AUTH_TOKEN` in production for SSE mode
- Restrict `CORS_ORIGINS` to trusted origins
- Run the container as non-root (Dockerfile does)
 - Prefer TLS for SSE (`VERIFY_TLS=1`)
 - Limit client network egress in production and rotate tokens regularly

### RAG (Postgres + pgvector)
- Set `DATABASE_URL` (or `PG*` envs) and `OPENAI_API_KEY`.
- Enable `vector` extension in Postgres (the app will attempt to create it).

Ingest files via CLI:
```bash
python -m rag.cli ingest path/to/dir path/to/file.pdf
```

Ask a question via CLI:
```bash
python -m rag.cli ask "What does the document say about refunds?"
```

Query with citations via client:
```bash
mcpx rag-query "What does the document say about refunds?" --server http://localhost:8000
```

HTTP endpoints (when server running):
- `POST /rag/upload` (multipart form with `files`)
- `POST /rag/query` JSON `{ "question": "..." }`
- `GET /rag/chunk/{chunk_id}` (get chunk metadata)

MCP tool:
- `rag_ask(question: str) -> str`

### OpenTelemetry Tracing
Enable distributed tracing with:
```bash
export OTEL_ENABLE=1
export OTEL_SERVICE_NAME=mcp-server
export OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:14268/api/traces
```

Traces include:
- RAG ingestion: file parsing, chunking, embedding, DB operations
- RAG retrieval: vector search, BM25 reranking, context assembly
- LLM calls: token usage, model info, latency
- Database operations: SQL queries, connection pooling

[FastMCP]: https://github.com/fastmcp/FastMCP


