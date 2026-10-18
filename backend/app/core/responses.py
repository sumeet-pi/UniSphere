"""Standard API Response and Error Envelope utilities conforming to API_SPECIFICATION.md."""

from datetime import datetime, timezone
from typing import Any
from fastapi.responses import JSONResponse


def success_envelope(
    data: Any = None,
    status_code: int = 200,
    message: str | None = None,
    meta: dict | None = None,
) -> dict:
    """Build standardized success envelope."""
    envelope = {
        "success": True,
        "statusCode": status_code,
    }
    if message:
        envelope["message"] = message
    if data is not None:
        envelope["data"] = data
    
    meta_payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "v1.0"
    }
    if meta:
        meta_payload.update(meta)
    envelope["meta"] = meta_payload
    return envelope


from fastapi.encoders import jsonable_encoder


def json_success_response(
    data: Any = None,
    status_code: int = 200,
    message: str | None = None,
    meta: dict | None = None,
) -> JSONResponse:
    """Return JSONResponse wrapping standardized success envelope."""
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(success_envelope(data, status_code, message, meta)),
    )


def error_envelope(
    status_code: int = 400,
    error: str = "BAD_REQUEST",
    message: str = "An error occurred",
    path: str = "",
    field_errors: list[dict] | None = None,
) -> dict:
    """Build standardized error envelope."""
    payload = {
        "success": False,
        "statusCode": status_code,
        "error": error,
        "message": message,
        "path": path,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if field_errors:
        payload["fieldErrors"] = field_errors
    return payload


def json_error_response(
    status_code: int = 400,
    error: str = "BAD_REQUEST",
    message: str = "An error occurred",
    path: str = "",
    field_errors: list[dict] | None = None,
) -> JSONResponse:
    """Return JSONResponse wrapping standardized error envelope."""
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(error_envelope(status_code, error, message, path, field_errors)),
    )
