import base64
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from app.db import get_db

router = APIRouter(prefix="/api/ledger", tags=["Ledger"])

GENESIS = "0" * 64
FIELDS = ("case_id", "seq", "event", "sample_id", "actor_id", "location", "ts", "data")

def canonical(entry: dict) -> bytes:
    # Utrzymuje klucze w odpowiedniej kolejności by JSON.dumps zawsze zwracał to samo
    payload = {k: entry.get(k) for k in FIELDS}
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

def entry_hash(prev_hash: str, entry: dict) -> str:
    return hashlib.sha256(prev_hash.encode("ascii") + b"|" + canonical(entry)).hexdigest()

def sign(key: Ed25519PrivateKey, h: str) -> str:
    return base64.b64encode(key.sign(bytes.fromhex(h))).decode()

# --- FUNKCJA GŁÓWNA DO DODAWANIA ZDARZEŃ ---
def add_ledger_entry(db: sqlite3.Connection, case_id: str, event: str, actor_id: str, 
                     sample_id: str = None, location: str = None, data: dict = None, ts_override: str = None):
    # 1. Sprawdzamy poprzedni wpis w łańcuchu
    row = db.execute("SELECT hash, seq FROM ledger WHERE case_id = ? ORDER BY seq DESC LIMIT 1", (case_id,)).fetchone()
    if row:
        prev_hash = row["hash"]
        seq = row["seq"] + 1
    else:
        prev_hash = GENESIS
        seq = 1

    # 2. Pobieramy klucz prywatny aktora (personelu lub serwera)
    actor = db.execute("SELECT private_key FROM staff WHERE id = ?", (actor_id,)).fetchone()
    if not actor or not actor["private_key"]:
        raise HTTPException(status_code=500, detail="Missing private key for actor")

    priv_key = Ed25519PrivateKey.from_private_bytes(bytes.fromhex(actor["private_key"]))
    
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    ts = ts_override if ts_override else datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    entry = {
        "case_id": case_id, "seq": seq, "event": event, 
        "sample_id": sample_id, "actor_id": actor_id, 
        "location": location, "ts": ts, "data": data or {}
    }
    
    # 3. Liczymy hasz i podpis
    h = entry_hash(prev_hash, entry)
    signature = sign(priv_key, h)
    
    # 4. Zapisujemy w bazie
    db.execute(
        """INSERT INTO ledger 
           (case_id, seq, event, sample_id, actor_id, location, ts, data_json, prev_hash, hash, signature) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (case_id, seq, event, sample_id, actor_id, location, ts, json.dumps(entry["data"]), prev_hash, h, signature)
    )
    db.commit()
    return entry

# --- WERYFIKACJA ŁAŃCUCHA DLA POLICJI / DEMO ---
def verify_chain(entries: list[dict], public_keys: dict, transition_ok) -> dict:
    prev = GENESIS
    for e in sorted(entries, key=lambda x: x["seq"]):
        if e["prev_hash"] != prev:
            return {"ok": False, "broken_at_seq": e["seq"], "reason": "prev_hash_mismatch"}
        
        h = entry_hash(prev, e)
        if h != e["hash"]:
            return {"ok": False, "broken_at_seq": e["seq"], "reason": "hash_mismatch"}
        
        try:
            pub_key_hex = public_keys.get(e["actor_id"])
            if not pub_key_hex:
                raise Exception("Missing public key")
            pub_key = Ed25519PublicKey.from_public_bytes(bytes.fromhex(pub_key_hex))
            pub_key.verify(base64.b64decode(e["signature"]), bytes.fromhex(h))
        except Exception:
            return {"ok": False, "broken_at_seq": e["seq"], "reason": "signature_invalid"}
        
        # Na razie puszczamy wszystkie przejścia, to dodamy w kolejnym kroku
        if not transition_ok(e):
            return {"ok": False, "broken_at_seq": e["seq"], "reason": "transition_invalid"}
        
        prev = e["hash"]
    return {"ok": True, "broken_at_seq": None, "reason": None}

@router.get("/verify")
def get_verify_ledger(case_id: str, db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM ledger WHERE case_id = ? ORDER BY seq", (case_id,)).fetchall()
    
    if not rows:
        return {"ok": True, "broken_at_seq": None, "reason": "empty"}

    entries = []
    actor_ids = set()
    for r in rows:
        e = dict(r)
        e["data"] = json.loads(e["data_json"]) if e["data_json"] else {}
        entries.append(e)
        actor_ids.add(e["actor_id"])

    # Zbieranie kluczy publicznych z bazy
    placeholders = ",".join("?" for _ in actor_ids)
    staff_rows = db.execute(f"SELECT id, public_key FROM staff WHERE id IN ({placeholders})", tuple(actor_ids)).fetchall()
    public_keys = {r["id"]: r["public_key"] for r in staff_rows}

    return verify_chain(entries, public_keys, lambda e: True)
