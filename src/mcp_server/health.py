from __future__ import annotations

import time
from typing import Dict


def healthz() -> Dict[str, str]:
    return {"status": "ok"}


def readyz() -> Dict[str, str]:
    # Add dependency checks if needed (db, cache, etc.)
    return {"status": "ready"}


def liveness_timestamp() -> float:
    return time.time()


