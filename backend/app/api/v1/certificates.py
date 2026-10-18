"""Certificates API endpoints conforming to API_SPECIFICATION.md Section 9."""
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.db.session import get_db
from app.models.event_details import Certificate
from app.core.responses import json_success_response

router = APIRouter(prefix="/certificates", tags=["Certificates"])


def generate_certificate_pdf(cert: Certificate) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CertTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        alignment=1,  # Center
        textColor=colors.HexColor("#1e3a8a"),
    )
    sub_style = ParagraphStyle(
        "CertSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        alignment=1,
        textColor=colors.HexColor("#475569"),
    )
    name_style = ParagraphStyle(
        "CertName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        alignment=1,
        textColor=colors.HexColor("#0f172a"),
    )
    body_style = ParagraphStyle(
        "CertBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=18,
        alignment=1,
        textColor=colors.HexColor("#334155"),
    )

    elements = []
    elements.append(Paragraph("UNISPHERE INSTITUTIONAL ACCREDITATION", sub_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("CERTIFICATE OF PARTICIPATION & EXCELLENCE", title_style))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("This is to proudly certify that", sub_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(cert.student_name, name_style))
    elements.append(Spacer(1, 8))
    elements.append(
        Paragraph(
            f"Roll No: <b>{cert.class_roll_no}</b> | {cert.course_branch}",
            sub_style,
        )
    )
    elements.append(Spacer(1, 15))
    elements.append(
        Paragraph(
            f"has actively participated and demonstrated exemplary co-curricular excellence in <b>{cert.event_title}</b>, "
            f"organized by <b>{cert.club_name}</b> on {cert.issue_date.isoformat()}.",
            body_style,
        )
    )
    elements.append(Spacer(1, 20))

    # Signatures table
    sig_data = [
        [
            Paragraph(f"<b>{cert.faculty_advisor_name}</b><br/>Faculty Advisor", sub_style),
            Paragraph(f"<b>NAAC Criterion: {cert.naac_criterion}</b><br/>ID: {cert.credential_id}", sub_style),
            Paragraph(f"<b>{cert.hod_name}</b><br/>Head of Department", sub_style),
        ]
    ]
    t = Table(sig_data, colWidths=[240, 240, 240])
    t.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    elements.append(t)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


@router.get("/{credential_id}")
def get_certificate_by_credential_id(
    credential_id: str,
    format: str | None = Query(None, description="Optional 'pdf' to download PDF certificate"),
    db: Session = Depends(get_db),
):
    """
    Get accredited institutional certificate verification data or download PDF.
    Conforms to API_SPECIFICATION.md Section 9.1.
    """
    cert = (
        db.query(Certificate)
        .filter(Certificate.credential_id == credential_id)
        .first()
    )
    if not cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate credential ID '{credential_id}' not found.",
        )

    if cert.status == "REVOKED":
        raise HTTPException(
            status_code=400,
            detail=f"Certificate credential '{credential_id}' has been revoked.",
        )

    if format == "pdf":
        pdf_bytes = generate_certificate_pdf(cert)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="Certificate_{cert.credential_id}.pdf"'
            },
        )

    data = {
        "credentialId": cert.credential_id,
        "eventTitle": cert.event_title,
        "clubName": cert.club_name,
        "studentName": cert.student_name,
        "classRollNo": cert.class_roll_no,
        "courseBranch": cert.course_branch,
        "date": cert.issue_date.isoformat(),
        "facultyAdvisor": cert.faculty_advisor_name,
        "hod": cert.hod_name,
        "naacCriterion": cert.naac_criterion,
        "status": cert.status,
        "verificationUrl": cert.pdf_url or f"https://unisphere.college.edu/verify/{cert.credential_id}",
    }
    return json_success_response(data=data, status_code=200)


@router.get("/{credential_id}/pdf")
def download_certificate_pdf(
    credential_id: str,
    db: Session = Depends(get_db),
):
    """Direct PDF download endpoint for certificates."""
    cert = (
        db.query(Certificate)
        .filter(Certificate.credential_id == credential_id)
        .first()
    )
    if not cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate credential ID '{credential_id}' not found.",
        )

    if cert.status == "REVOKED":
        raise HTTPException(
            status_code=400,
            detail=f"Certificate credential '{credential_id}' has been revoked.",
        )

    pdf_bytes = generate_certificate_pdf(cert)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Certificate_{cert.credential_id}.pdf"'
        },
    )
