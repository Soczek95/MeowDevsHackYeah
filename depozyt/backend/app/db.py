import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "depozyt.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.executescript("""
            CREATE TABLE IF NOT EXISTS cases (
              id TEXT PRIMARY KEY,
              key_hash TEXT NOT NULL,
              status TEXT NOT NULL,
              origin TEXT NOT NULL,
              hospital_id TEXT,
              created_at TEXT NOT NULL,
              expires_at TEXT NOT NULL,
              destroy_after TEXT
            );
            CREATE TABLE IF NOT EXISTS samples (
              id TEXT PRIMARY KEY,
              case_id TEXT NOT NULL REFERENCES cases(id),
              type TEXT NOT NULL,
              state TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS ledger (
              case_id TEXT NOT NULL,
              seq INTEGER NOT NULL,
              event TEXT NOT NULL,
              sample_id TEXT,
              actor_id TEXT NOT NULL,
              location TEXT,
              ts TEXT NOT NULL,
              data_json TEXT NOT NULL,
              prev_hash TEXT NOT NULL,
              hash TEXT NOT NULL,
              signature TEXT NOT NULL,
              PRIMARY KEY (case_id, seq)
            );
            CREATE TABLE IF NOT EXISTS staff (
              id TEXT PRIMARY KEY, 
              name TEXT, 
              hospital_id TEXT, 
              public_key TEXT, 
              private_key TEXT
            );
            CREATE TABLE IF NOT EXISTS release_tokens (
              token TEXT PRIMARY KEY, 
              case_id TEXT, 
              created_at TEXT, 
              expires_at TEXT
            );
            CREATE TABLE IF NOT EXISTS anchors (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              ts TEXT, 
              anchor_hash TEXT, 
              cases INTEGER
            );
            CREATE TABLE IF NOT EXISTS signals (
              id TEXT PRIMARY KEY, venue_id TEXT, date TEXT, time_bucket TEXT, relation TEXT,
              traits_json TEXT, ident_hmac TEXT, device_hash TEXT, consent_contact INTEGER, created_at TEXT
            );
        """)
        conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")