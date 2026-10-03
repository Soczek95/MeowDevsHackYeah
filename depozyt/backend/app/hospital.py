from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
import sqlite3
import secrets
from datetime import datetime, timezone
from app.db import get_db
from app.ledger import add_ledger_entry

router = APIRouter(tags=["Hospital"])

# --- MODELE ŻĄDAŃ ---
class AdmitRequest(BaseModel):
    staff_id: str
    hospital_id: str

class AddSampleRequest(BaseModel):
    staff_id: str
    type: str  # sample_id usunięte - generuje je backend

class SampleEventRequest(BaseModel):
    staff_id: str
    event: str
    location: str

# --- ENDPOINTY ---

@router.post("/api/cases/{case_id}/admit")
def admit_case(case_id: str, req: AdmitRequest, x_staff_token: str = Header(default=None), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT status FROM cases WHERE id = ?", (case_id,)).fetchone()
    if not case:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Sprawa nie istnieje"})
    
    # Maszyna stanów: Tylko sprawy CREATED mogą być przyjęte przez szpital
    if case["status"] not in ["CREATED", "ADMITTED", "IN_DEPOSIT"]:
        raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Nie można przyjąć tej sprawy"})

    # Zmiana statusu w bazie
    db.execute("UPDATE cases SET status = 'ADMITTED', hospital_id = ? WHERE id = ?", (req.hospital_id, case_id))
    
    # Zapis do Ledgera
    entry = add_ledger_entry(db, case_id=case_id, event="ADMITTED", actor_id=req.staff_id)
    
    return {"status": "ADMITTED", "entry_seq": entry["seq"]}


@router.post("/api/cases/{case_id}/samples")
def add_sample(case_id: str, req: AddSampleRequest, x_staff_token: str = Header(default=None), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT status FROM cases WHERE id = ?", (case_id,)).fetchone()
    if not case or case["status"] not in ["ADMITTED", "IN_DEPOSIT"]:
        raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Sprawa nie jest w odpowiednim statusie"})

    # Generowanie unikalnego ID dla próbki i znaczników czasu
    sample_id = f"S-{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Zapisujemy próbkę wraz z datą utworzenia i modyfikacji
    db.execute(
        "INSERT INTO samples (id, case_id, type, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", 
        (sample_id, case_id, req.type, "COLLECTED", now_str, now_str)
    )

    # Aktualizacja sprawy na IN_DEPOSIT (jeśli to pierwsza próbka)
    if case["status"] == "ADMITTED":
        db.execute("UPDATE cases SET status = 'IN_DEPOSIT' WHERE id = ?", (case_id,))

    # Zapis do Ledgera
    entry = add_ledger_entry(db, case_id=case_id, event="COLLECTED", actor_id=req.staff_id, sample_id=sample_id)
    
    return {
        "status": "SUCCESS", 
        "sample_id": sample_id, 
        "state": "COLLECTED", 
        "created_at": now_str,
        "updated_at": now_str,
        "entry_seq": entry["seq"]
    }


@router.post("/api/samples/{sample_id}/events")
def sample_event(sample_id: str, req: SampleEventRequest, x_staff_token: str = Header(default=None), db: sqlite3.Connection = Depends(get_db)):
    sample = db.execute("SELECT case_id, state FROM samples WHERE id = ?", (sample_id,)).fetchone()
    if not sample:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Próbka nie istnieje"})

    # Maszyna stanów dla fiolek: COLLECTED -> SEALED -> STORED
    valid_transitions = {
        "SEALED": ["COLLECTED"],
        "STORED": ["SEALED"]
    }

    if req.event not in valid_transitions or sample["state"] not in valid_transitions[req.event]:
        raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": f"Nie można przejść ze stanu {sample['state']} do {req.event}"})

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Aktualizujemy stan ORAZ datę ostatniej modyfikacji (updated_at)
    db.execute("UPDATE samples SET state = ?, updated_at = ? WHERE id = ?", (req.event, now_str, sample_id))
    
    # Zapis do Ledgera
    entry = add_ledger_entry(db, case_id=sample["case_id"], event=req.event, actor_id=req.staff_id, sample_id=sample_id, location=req.location)
    
    return {
        "state": req.event, 
        "updated_at": now_str,
        "entry_seq": entry["seq"]
    }


@router.get("/api/samples/{sample_id}")
def get_sample_status(sample_id: str, db: sqlite3.Connection = Depends(get_db)):
    sample = db.execute("SELECT id, type, state, created_at, updated_at FROM samples WHERE id = ?", (sample_id,)).fetchone()
    if not sample:
        raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "Próbka nie istnieje"})
    
    return dict(sample)
