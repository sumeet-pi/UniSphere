"""UniSphere Backend — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine
import app.models  # Ensure all ORM models are registered
from app.routers import auth

app = FastAPI(
    title="UniSphere API",
    description="College Clubs and Student Activities Management Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers — Only Authentication APIs
app.include_router(auth.router)


@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "unisphere-api"}


@app.get("/api/health/db")
def health_db():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": type(e).__name__}
