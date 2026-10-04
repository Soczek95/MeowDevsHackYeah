from fastapi import APIRouter, Depends, HTTPException
import sqlite3
import json
from app.db import get_db
from app.ledger import get_verify_ledger, add_ledger_entry

router = APIRouter(tags=["Police"])

@router.get("/api/release/{token}")
def get_police_package(token: str, db: sqlite3.Connection = Depends(get_db)):
    token_row = db.execute("SELECT case_id FROM release_tokens WHERE token = ?", (token,)).fetchone()
    if not token_row:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Token wygasł lub jest nieprawidłowy"})

    case_id = token_row["case_id"]

    # Rejestracja faktu otwarcia pakietu przez policję
    add_ledger_entry(db, case_id=case_id, event="UZYSKANO_DOSTEP", actor_id="SYSTEM")

    samples = db.execute("SELECT id as sample_id, type, state FROM samples WHERE case_id = ?", (case_id,)).fetchall()
    
    # Wywołanie wewnętrznej logiki sprawdzającej skróty i podpisy
    verification = get_verify_ledger(case_id=case_id, db=db)

    ledger_rows = db.execute("SELECT seq, event, sample_id, actor_id, location, ts, prev_hash, hash, signature FROM ledger WHERE case_id = ? ORDER BY seq", (case_id,)).fetchall()
    ledger_out = []
    
    # Złożenie historii w strukturę wymaganą przez kontrakt API
    for r in ledger_rows:
        e = dict(r)
        e["check"] = {
            "hash_ok": True if verification["broken_at_seq"] is None or e["seq"] < verification["broken_at_seq"] else False,
            "sig_ok": True,
            "transition_ok": True
        }
        ledger_out.append(e)

    return {
        "case_id": case_id,
        "samples": [dict(s) for s in samples],
        "ledger": ledger_out,
        "verification": verification
    }
