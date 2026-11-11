from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, buildings

app = FastAPI(title="NašBlok API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(buildings.router)


@app.get("/api/health")
def health():
    """Preverjanje, ali backend deluje."""
    return {"status": "ok"}
