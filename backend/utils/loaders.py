import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_schemes() -> dict:
    with open(DATA_DIR / "schemes.json", "r", encoding="utf-8") as f:
        schemes = json.load(f)
    return {s["id"]: s for s in schemes}


def get_scheme(scheme_id: str) -> dict | None:
    return load_schemes().get(scheme_id)