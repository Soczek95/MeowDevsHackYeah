from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.demo import router as demo_router
from app.cases import router as cases_router
from app.ledger import router as ledger_router
from app.hospital import router as hospital_router
from app.police import router as police_router

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
app.include_router(cases_router)
app.include_router(ledger_router)
app.include_router(hospital_router)
app.include_router(police_router)



@app.get("/health")
def health_check():
    return {"status": "ok", "system": "Depozyt"}
