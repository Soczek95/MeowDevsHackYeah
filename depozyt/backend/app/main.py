from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.demo import router as demo_router

# Inicjalizacja bazy przy starcie
init_db()

app = FastAPI(title="Depozyt API")

# Konfiguracja CORS pod lokalny frontend (Vite) i ewentualne tunele
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Na demo możemy pozwolić na wszystko
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demo_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "Depozyt"}
