from fastapi import APIRouter, Depends
import json
from pathlib import Path
from app.db import get_db
import sqlite3

router = APIRouter(prefix="/api/demo", tags=["Demo"])
SEED_PATH = Path(__file__).parent.parent / "seed" / "seed.json"

@router.post("/reset")
def reset_database(db: sqlite3.Connection = Depends(get_db)):
    # Tutaj załadujemy seed.json. Na razie czyścimy bazę na szybko.
    tables = ["cases", "samples", "ledger", "staff", "release_tokens", "anchors", "signals"]
    for table in tables:
        db.execute(f"DELETE FROM {table}")
    db.commit()
    return {"message": "Database cleared. Seed loading pending."}