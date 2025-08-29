import os
import threading
import time

import httpx
import pytest

from mcp_server.app import create_app


@pytest.fixture(scope="session")
def sse_server():
	os.environ["HOST"] = "127.0.0.1"
	os.environ["PORT"] = "9876"
	app = create_app()

	# Run FastMCP HTTP app (SSE transport) via uvicorn in a thread
	import uvicorn

	config = uvicorn.Config(app.http_app(path="/sse", transport="sse"), host="127.0.0.1", port=9876, log_level="warning")
	srv = uvicorn.Server(config)
	thread = threading.Thread(target=lambda: srv.run(), daemon=True)
	thread.start()
	# Wait for server start
	time.sleep(1.2)
	yield
	# Attempt shutdown
	srv.should_exit = True
	thread.join(timeout=2)


def test_healthz(sse_server):
	resp = httpx.get("http://127.0.0.1:9876/healthz", timeout=5)
	assert resp.status_code == 200
	assert resp.json().get("status") == "ok"


def test_metrics(sse_server):
	resp = httpx.get("http://127.0.0.1:9876/metrics", timeout=5)
	assert resp.status_code == 200
	assert "python_gc_objects_collected_total" in resp.text
