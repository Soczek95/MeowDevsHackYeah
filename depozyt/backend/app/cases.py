import hashlib 
import secrets 
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.db import get_db
import sqlite3
import secrets
from app.ledger import add_ledger_entry

router = APIRouter(prefix="/api/cases", tags=["Cases"])

ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUWXYZ"

def generate_case_id(prefix="DP", blocks=2, length=4):
    """Generuje unikalny identyfikator sprawy w formacie DP-XXXX-XXXX"""
    parts = []
    for _ in range(blocks):
        part = ''.join(secrets.choice(ALPHABET) for _ in range(length))
        parts.append(part)
    return f"{prefix}-{'-'.join(parts)}"

def generate_key_hash():
    parts = ["".join(secrets.choice(ALPHABET) for _ in range(4)) for _ in range(4)]
    return "-".join(parts)

def hash_key(key:str) -> str:
    """Zwraca SHA256 hash klucza w formacie hex"""
    return hashlib.sha256(key.encode("utf-8")).hexdigest()

class CreateCaseRequest(BaseModel):
    origin: str

@router.post("",status_code=201)
def create_case(request: CreateCaseRequest, db: sqlite3.Connection = Depends(get_db)):
    case_id = generate_case_id()
    key = generate_key_hash()
    key_hash = hash_key(key)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=365)  # Przykładowy czas wygaśnięcia
    
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    expires_at_str = expires_at.strftime("%Y-%m-%d %H:%M:%S")
    
    
    db.execute(
        "INSERT INTO cases (id, key_hash, status, origin, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
        (case_id, key_hash, "CREATED", request.origin, now_str, expires_at_str)
    )
    db.commit()
    return {"case_id": case_id, "case_key": key}

@router.get("/{case_id}/status")
def get_case_status(case_id: str,x_case_key: str = Header(...), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case["key_hash"] != hash_key(x_case_key):
        raise HTTPException(status_code=403, detail="Invalid key")
    return {"case_id": case_id, "status": case["status"], "origin": case["origin"], "created_at": case["created_at"], "expires_at": case["expires_at"]}

class DecisionRequest(BaseModel):
    decision: str
    
@router.post("/{case_id}/decisions")
def make_decision(case_id: str, req: DecisionRequest, x_case_key: str = Header(...), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT status, key_hash FROM cases WHERE id = ?", (case_id,)).fetchone()
    
    if not case:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Sprawa nie istnieje"})
    if case["key_hash"] != hash_key(x_case_key):
        raise HTTPException(status_code=401, detail={"error": "INVALID_KEY", "message": "Nieprawidłowy klucz"})

    if req.decision == "RELEASE":
        if case["status"] != "IN_DEPOSIT":
            raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Brak próbek w depozycie"})

        token = secrets.token_hex(4)
        db.execute("UPDATE cases SET status = 'RELEASED' WHERE id = ?", (case_id,))
        db.execute("INSERT INTO release_tokens (token, case_id) VALUES (?, ?)", (token, case_id))
        
        # Logujemy decyzję pokrzywdzonej
        add_ledger_entry(db, case_id=case_id, event="DECISION_RELEASE", actor_id="SYSTEM")
        db.commit()

        return {
            "status": "RELEASED",
            "release_url": f"/policja/r/{token}",
            "expires_at": "2026-10-10T11:42:00Z"
        }
    
    raise HTTPException(status_code=400, detail="Inne decyzje zostaną obsłużone w fazie P1")