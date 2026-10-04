from fastapi import APIRouter, Depends, HTTPException
import json
from pathlib import Path
from app.db import get_db
import sqlite3
import hashlib
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from pydantic import BaseModel
from app.ledger import add_ledger_entry

router = APIRouter(prefix="/api/demo", tags=["Demo"])
SEED_PATH = Path(__file__).parent.parent / "seed" / "seed.json"

def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()

@router.post("/reset")
def reset_database(db: sqlite3.Connection = Depends(get_db)):
    # 1. Czyszczenie tabel
    tables = ["cases", "samples", "ledger", "staff", "release_tokens", "anchors", "signals"]
    for table in tables:
        db.execute(f"DELETE FROM {table}")
    
    # 2. Ładowanie pliku seed.json
    if not SEED_PATH.exists():
        raise HTTPException(status_code=500, detail="seed.json not found")
        
    with open(SEED_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for s in data.get("staff", []):
        pub = s.get("public_key", "")
        priv = s.get("private_key", "")
        
        if not priv:
                new_key = Ed25519PrivateKey.generate()
                priv = new_key.private_bytes_raw().hex()
                pub = new_key.public_key().public_bytes_raw().hex()
        db.execute(
            "INSERT INTO staff (id, name, hospital_id, public_key, private_key) VALUES (?, ?, ?, ?, ?)", (s["id"], s["name"], s["hospital_id"], pub, priv)
        )
        
        

        
# 4. Wrzucanie spraw, próbek i ZDARZEŃ DO DZIENNIKA
    for c in data.get("cases", []):
        key_hash = hash_key(c["case_key"])
        db.execute(
            "INSERT INTO cases (id, key_hash, status, origin, hospital_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (c["id"], key_hash, c["status"], c["origin"], c["hospital_id"], c["created_at"], c["expires_at"])
        )
        
        for sample in c.get("samples", []):
            db.execute(
                "INSERT INTO samples (id, case_id, type, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (sample["id"], c["id"], sample["type"], sample["state"], c["created_at"], c["created_at"])
            )

            
        # MAGIA DEMO: Generujemy dziennik ze skrótami na podstawie seeda
        for ev in c.get("events", []):
            add_ledger_entry(
                db=db,
                case_id=c["id"],
                event=ev["event"],
                actor_id=ev["actor_id"],
                sample_id=ev.get("sample_id"),
                location=ev.get("location"),
                ts_override=ev["ts"] # <--- Przekazujemy czas ze seeda podczas liczenia hasza!
            )
            # W środowisku testowym musimy zaktualizować czas na ten z seeda,
            # bo add_ledger_entry wstawia datetime.now(). Dla dema nadpisujemy to SQL-em:
            db.execute(
                "UPDATE ledger SET ts = ? WHERE case_id = ? AND seq = (SELECT MAX(seq) FROM ledger WHERE case_id = ?)",
                (ev["ts"], c["id"], c["id"])
            )
            
    db.commit()
    return {"message": "Database reset and seeded successfully."}


class TamperRequest(BaseModel):
    case_id: str
    seq: int
    field: str
    value: str

@router.post("/tamper")
def tamper_ledger(req: TamperRequest, db: sqlite3.Connection = Depends(get_db)):
    # Pobieramy oryginalny wpis
    row = db.execute("SELECT * FROM ledger WHERE case_id = ? AND seq = ?", (req.case_id, req.seq)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Wpis nie istnieje")

    # Brutalnie podmieniamy wartość w bazie (nie ruszając skrótu hash i podpisu!)
    # Symulujemy hakera, który wchodzi bezpośrednio do bazy SQL
    allowed_fields = ["location", "event", "actor_id"]
    if req.field in allowed_fields:
        db.execute(f"UPDATE ledger SET {req.field} = ? WHERE case_id = ? AND seq = ?", 
                   (req.value, req.case_id, req.seq))
        db.commit()
        return {"tampered": True}
    else:
        raise HTTPException(status_code=400, detail="Nie można podmienić tego pola w demo")
