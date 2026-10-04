import hashlib 
import secrets 
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.db import get_db
import sqlite3
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

@router.post("", status_code=201)
def create_case(request: CreateCaseRequest, db: sqlite3.Connection = Depends(get_db)):
    case_id = generate_case_id()
    key = generate_key_hash()
    key_hash = hash_key(key)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=365)
    
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    expires_at_str = expires_at.strftime("%Y-%m-%d %H:%M:%S")
    
    db.execute(
        "INSERT INTO cases (id, key_hash, status, origin, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
        (case_id, key_hash, "UTWORZONA", request.origin, now_str, expires_at_str)
    )
    db.commit()
    return {"case_id": case_id, "case_key": key}

@router.get("/{case_id}/status")
def get_case_status(case_id: str, x_case_key: str = Header(...), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case["key_hash"] != hash_key(x_case_key.strip()):
        raise HTTPException(status_code=403, detail="Invalid key")
        
    samples = db.execute("""
        SELECT id, type, state, created_at, updated_at 
        FROM samples 
        WHERE case_id = ?
        ORDER BY created_at DESC
    """, (case_id,)).fetchall()
    
    return {
        "case_id": case_id, 
        "status": case["status"], 
        "origin": case["origin"], 
        "created_at": case["created_at"], 
        "expires_at": case["expires_at"],
        "samples": [dict(sample) for sample in samples]  
    }

class DecisionRequest(BaseModel):
    decision: str
    
@router.post("/{case_id}/decisions")
def make_decision(case_id: str, req: DecisionRequest, x_case_key: str = Header(...), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT status, key_hash, expires_at FROM cases WHERE id = ?", (case_id,)).fetchone()
    
    if not case:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Sprawa nie istnieje"})
    if case["key_hash"] != hash_key(x_case_key.strip()):
        raise HTTPException(status_code=401, detail={"error": "INVALID_KEY", "message": "Nieprawidłowy klucz"})

    now = datetime.now(timezone.utc)

    # 1. PRZEKAZANIE POLICJI
    if req.decision == "RELEASE":
        if case["status"] not in ["W_DEPOZYCIE", "PRZEDLUZONA"]:
            raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Brak próbek w depozycie"})

        token = secrets.token_hex(4)
        db.execute("UPDATE cases SET status = 'WYDANA' WHERE id = ?", (case_id,))
        db.execute("INSERT INTO release_tokens (token, case_id) VALUES (?, ?)", (token, case_id))
        
        add_ledger_entry(db, case_id=case_id, event="DECISION_RELEASE", actor_id="VICTIM")
        db.commit()

        return {
            "status": "WYDANA",
            "release_url": f"/policja/r/{token}",
            "expires_at": case["expires_at"]
        }
    
    # 2. PRZEDŁUŻENIE DEPOZYTU O 180 DNI
    elif req.decision == "EXTEND":
        current_expires = datetime.strptime(case["expires_at"], "%Y-%m-%d %H:%M:%S")
        new_expires = current_expires + timedelta(days=180)
        new_expires_str = new_expires.strftime("%Y-%m-%d %H:%M:%S")
        
        db.execute("UPDATE cases SET status = 'PRZEDLUZONA', expires_at = ? WHERE id = ?", (new_expires_str, case_id))
        add_ledger_entry(db, case_id=case_id, event="DECISION_EXTEND", actor_id="VICTIM")
        db.commit()
        
        return {"status": "PRZEDLUZONA", "expires_at": new_expires_str}
        
    # 3. ZGŁOSZENIE DO ZAMKNIĘCIA / USUNIĘCIA
    elif req.decision == "REQUEST_CLOSURE":
        new_expires = now + timedelta(days=30)
        new_expires_str = new_expires.strftime("%Y-%m-%d %H:%M:%S")
        
        db.execute("UPDATE cases SET status = 'ZGLOSZONA_DO_ZAMKNIECIA', expires_at = ? WHERE id = ?", (new_expires_str, case_id))
        add_ledger_entry(db, case_id=case_id, event="DECISION_CLOSE", actor_id="VICTIM")
        db.commit()
        
        return {"status": "ZGLOSZONA_DO_ZAMKNIECIA", "expires_at": new_expires_str}

    raise HTTPException(status_code=400, detail="Nieznana decyzja")
