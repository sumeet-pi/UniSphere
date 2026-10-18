"""UniSphere Backend — FastAPI application entry point conforming to API_SPECIFICATION.md."""

from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine
import app.models  # Ensure all ORM models are registered
from app.api.v1 import api_v1_router
from app.routers import auth as legacy_auth

app = FastAPI(
    title="UniSphere API",
    description="College Clubs and Student Activities Management Platform (NAAC Criterion 5.3)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Centralized error handler for RequestValidationError (FastAPI / Pydantic validation errors)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field_name = str(err["loc"][-1]) if err["loc"] else "body"
        errors.append(
            {
                "field": field_name,
                "rejectedValue": err.get("input", None),
                "message": err.get("msg", "Invalid field value"),
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "statusCode": 422,
            "error": "VALIDATION_ERROR",
            "message": "Validation failed on submitted fields",
            "path": request.url.path,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "fieldErrors": errors,
        },
    )



# Centralized error handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "UNPROCESSABLE_ENTITY",
        500: "INTERNAL_SERVER_ERROR",
    }
    error_code = code_map.get(exc.status_code, "ERROR")

    # If detail is already a dict, merge nicely
    detail_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "statusCode": exc.status_code,
            "error": error_code,
            "message": detail_msg,
            "detail": exc.detail,
            "path": request.url.path,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# Routers
# Modern standard API v1 conforming to API_SPECIFICATION.md
app.include_router(api_v1_router)

# Backwards compatibility legacy auth router
app.include_router(legacy_auth.router)


# Liveness and Readiness Probes
@app.get("/health", tags=["System Health"])
@app.get("/health/live", tags=["System Health"])
@app.get("/api/health", tags=["System Health"])
def health():
    return {
        "status": "healthy",
        "service": "unisphere-api",
        "version": "v1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/health/ready", tags=["System Health"])
@app.get("/api/health/db", tags=["System Health"])
def health_db():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        return {
            "status": "healthy",
            "database": "connected",
            "provider": "Neon PostgreSQL",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": type(e).__name__,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
