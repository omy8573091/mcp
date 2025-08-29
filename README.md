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
python3 -m venv .venv
. .venv/bin/activate
pip install -U pip
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

HTTP endpoints (when server running):
- `POST /rag/upload` (multipart form with `files`)
- `POST /rag/query` JSON `{ "question": "..." }`

MCP tool:
- `rag_ask(question: str) -> str`

[FastMCP]: https://github.com/fastmcp/FastMCP


