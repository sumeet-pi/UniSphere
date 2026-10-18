"""UniSphere API v1 Router Registration."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.students import router as students_router
from app.api.v1.clubs import router as clubs_router
from app.api.v1.events import router as events_router
from app.api.v1.registrations import router as registrations_router
from app.api.v1.certificates import router as certificates_router
from app.api.v1.announcements import router as announcements_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(students_router, prefix="/students", tags=["Students"])
api_v1_router.include_router(clubs_router, prefix="/clubs", tags=["Clubs"])
api_v1_router.include_router(events_router, prefix="/events", tags=["Events"])
api_v1_router.include_router(registrations_router, tags=["Registrations & Passes"])
api_v1_router.include_router(certificates_router, tags=["Certificates & NAAC 5.3"])
api_v1_router.include_router(announcements_router, tags=["Announcements"])
api_v1_router.include_router(analytics_router, tags=["Analytics & NAAC Audit"])
api_v1_router.include_router(admin_router, tags=["Admin Governance"])
