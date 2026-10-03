from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
import sqlite3
from app.db import get_db
from app.ledger import add_ledger_entry

router = APIRouter(tags=["Hospital"])

# --- MODELE ŻĄDAŃ ---
class AdmitRequest(BaseModel):
    staff_id: str
    hospital_id: str

class AddSampleRequest(BaseModel):
    staff_id: str
    sample_id: str
    type: str

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
    if case["status"] != "CREATED":
        raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Nie można przyjąć tej sprawy"})

    # Zmiana statusu w bazie
    db.execute("UPDATE cases SET status = 'ADMITTED', hospital_id = ? WHERE id = ?", (req.hospital_id, case_id))
    
    # Zapis do Ledgera!
    entry = add_ledger_entry(db, case_id=case_id, event="ADMITTED", actor_id=req.staff_id)
    
    return {"status": "ADMITTED", "entry_seq": entry["seq"]}

@router.post("/api/cases/{case_id}/samples")
def add_sample(case_id: str, req: AddSampleRequest, x_staff_token: str = Header(default=None), db: sqlite3.Connection = Depends(get_db)):
    case = db.execute("SELECT status FROM cases WHERE id = ?", (case_id,)).fetchone()
    if not case or case["status"] not in ["ADMITTED", "IN_DEPOSIT"]:
        raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Sprawa nie jest w odpowiednim statusie"})

    # Zapisujemy próbkę
    try:
        db.execute("INSERT INTO samples (id, case_id, type, state) VALUES (?, ?, ?, ?)", 
                   (req.sample_id, case_id, req.type, "COLLECTED"))
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail={"error": "INVALID_TRANSITION", "message": "Próbka o tym ID już istnieje"})

    # Aktualizacja sprawy na IN_DEPOSIT (jeśli to pierwsza próbka)
    if case["status"] == "ADMITTED":
        db.execute("UPDATE cases SET status = 'IN_DEPOSIT' WHERE id = ?", (case_id,))

    # Zapis do Ledgera
    entry = add_ledger_entry(db, case_id=case_id, event="COLLECTED", actor_id=req.staff_id, sample_id=req.sample_id)
    
    return {"state": "COLLECTED", "entry_seq": entry["seq"]}

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

    # Zmiana stanu próbki
    db.execute("UPDATE samples SET state = ? WHERE id = ?", (req.event, sample_id))

    # Zapis do Ledgera
    entry = add_ledger_entry(db, case_id=sample["case_id"], event=req.event, actor_id=req.staff_id, sample_id=sample_id, location=req.location)
    
    return {"state": req.event, "entry_seq": entry["seq"]}
