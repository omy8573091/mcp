VENV=.venv
PY=$(VENV)/bin/python
PIP=$(VENV)/bin/pip

.PHONY: venv install dev lint type test stdio sse

venv:
	python3 -m venv $(VENV)
	$(PIP) install -U pip

install: venv
	$(PIP) install -e .

dev: venv
	$(PIP) install -e .[dev]

lint:
	$(VENV)/bin/ruff check .

type:
	$(VENV)/bin/mypy src

test:
	$(VENV)/bin/pytest -q

sbom:
	which syft >/dev/null 2>&1 || curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
	syft packages dir:. -o spdx-json=sbom.spdx.json || true

scan:
	which trivy >/dev/null 2>&1 || echo "Install trivy for scans: https://aquasecurity.github.io/trivy/" && true
	trivy fs --severity HIGH,CRITICAL --exit-code 0 --format table . || true

stdio:
	$(VENV)/bin/mcp-server-stdio

sse:
	$(VENV)/bin/mcp-server-sse


