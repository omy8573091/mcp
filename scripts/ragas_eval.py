from __future__ import annotations

import os
import json
import requests

# Minimal RAGAS-like scaffold: query a set and compute dumb accuracy proxy

DATASET = [
    {"question": "What is the purpose of this project?", "contains": "MCP"},
]


def main() -> None:
    base = os.environ.get("BASE_URL", "http://localhost:8000")
    token = os.environ.get("AUTH_TOKEN")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    results = []
    for item in DATASET:
        r = requests.post(f"{base}/rag/query", json={"question": item["question"]}, headers=headers, timeout=30)
        r.raise_for_status()
        ans = r.json().get("answer", "")
        ok = item["contains"].lower() in ans.lower()
        results.append({"question": item["question"], "ok": ok})
    score = sum(1 for r in results if r["ok"]) / max(1, len(results))
    print(json.dumps({"accuracy_proxy": score, "results": results}, indent=2))


if __name__ == "__main__":
    main()


