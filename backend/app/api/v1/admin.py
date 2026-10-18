"""University Administrator Governance API endpoints conforming to API_SPECIFICATION.md Section 13."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.club import Club
from app.models.user import User
from app.core.dependencies import require_role
from app.core.responses import json_success_response
from app.schemas.unified import ClubRejectRequest

router = APIRouter(prefix="/admin", tags=["University Administration"])


@router.get("/clubs/pending")
def list_pending_clubs(
    department: str | None = Query(None),
    category: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["ADMIN"])),
):
    """
    List all pending campus clubs awaiting administrative review.
    Conforms to API_SPECIFICATION.md Section 13.1.
    """
    from sqlalchemy import or_
    query = db.query(Club).filter(
        Club.approval_status.notin_(["approved", "rejected"]),
        or_(
            Club.approval_status.in_(["requested", "pending"]),
            Club.status.ilike("pending"),
            Club.status.ilike("requested"),
        ),
    )

    if department:
        query = query.filter(Club.department.ilike(f"%{department}%"))
    if category:
        query = query.filter(Club.category.ilike(f"%{category}%"))

    total_pending = query.count()
    clubs = query.order_by(Club.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    data = []
    for c in clubs:
        year = c.created_at.year if c.created_at else 2026
        dept_prefix = (c.department[:3].upper() if c.department else "GEN").replace(" ", "")
        ref_id = f"REQ-{year}-{dept_prefix}-{c.id[-4:] if len(c.id) >= 4 else c.id}"

        data.append(
            {
                "id": c.id,
                "referenceId": ref_id,
                "name": c.name,
                "category": c.category,
                "department": c.department,
                "facultyAdvisor": c.faculty_advisor_name,
                "hod": c.hod_name,
                "email": c.email,
                "phone": c.phone,
                "clubCode": c.club_code,
                "approvalStatus": c.approval_status,
                "status": "Requested",
                "submittedAt": c.created_at.isoformat() if c.created_at else datetime.now(timezone.utc).isoformat(),
            }
        )

    return json_success_response(data=data, meta={"totalPending": total_pending}, status_code=200)


@router.patch("/clubs/{club_id}/approve")
def approve_club_application(
    club_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["ADMIN"])),
):
    """
    Admin approves a requested club.
    Transitions approval_status from requested -> approved.
    Also activates the coordinator user account and membership.
    Conforms to API_SPECIFICATION.md Section 13.2.
    """
    from app.models.membership import ClubMembership

    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club ID does not exist.")

    if club.approval_status == "approved":
        raise HTTPException(
            status_code=409,
            detail="Club application is already approved.",
        )

    now = datetime.now(timezone.utc)
    club.approval_status = "approved"
    club.status = "ACTIVE"
    club.approved_by = current_admin.id
    club.approved_at = now

    # Activate the coordinator's user account
    coordinator = None
    if club.coordinator_id:
        coordinator = db.query(User).filter(User.id == club.coordinator_id).first()
    if not coordinator and club.faculty_advisor_id:
        coordinator = db.query(User).filter(User.id == club.faculty_advisor_id).first()
    if not coordinator and club.email:
        coordinator = db.query(User).filter(User.email == club.email).first()

    if coordinator:
        coordinator.status = "active"
        coordinator.is_active = True

    # Activate coordinator memberships for this club
    pending_memberships = (
        db.query(ClubMembership)
        .filter(
            ClubMembership.club_id == club.id,
            ClubMembership.status.in_(["pending", "PENDING"]),
        )
        .all()
    )
    for m in pending_memberships:
        m.status = "ACTIVE"

    db.commit()
    db.refresh(club)

    data = {
        "id": club.id,
        "name": club.name,
        "approvalStatus": club.approval_status,
        "status": club.status,
        "approvedAt": club.approved_at.isoformat() if club.approved_at else now.isoformat(),
        "approvedBy": club.approved_by,
    }

    return json_success_response(
        data=data,
        message="Club approved successfully. Coordinator dashboard unlocked.",
        status_code=200,
    )


@router.patch("/clubs/{club_id}/reject")
def reject_club_application(
    club_id: str,
    payload: ClubRejectRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["ADMIN"])),
):
    """
    Admin rejects a requested club with justification.
    Transitions approval_status from requested -> rejected.
    Conforms to API_SPECIFICATION.md Section 13.3.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club ID does not exist.")

    reason = (payload.rejectionReason or payload.reason or getattr(payload, "rejection_reason", None) or "").strip()
    if not reason:
        raise HTTPException(
            status_code=400,
            detail="Rejection reason must be provided.",
        )

    now = datetime.now(timezone.utc)
    club.approval_status = "rejected"
    club.status = "REJECTED"
    club.rejection_reason = reason
    club.approved_by = current_admin.id
    club.approved_at = now

    coordinator = None
    if club.coordinator_id:
        coordinator = db.query(User).filter(User.id == club.coordinator_id).first()
    if not coordinator and club.faculty_advisor_id:
        coordinator = db.query(User).filter(User.id == club.faculty_advisor_id).first()
    if not coordinator and club.email:
        coordinator = db.query(User).filter(User.email == club.email).first()
    if coordinator and coordinator.status == "pending":
        coordinator.status = "rejected"

    db.commit()
    db.refresh(club)

    data = {
        "id": club.id,
        "name": club.name,
        "approvalStatus": club.approval_status,
        "rejectionReason": club.rejection_reason,
        "reviewedAt": now.isoformat(),
        "reviewedBy": current_admin.id,
    }

    return json_success_response(
        data=data,
        message="Club application rejected.",
        status_code=200,
    )
