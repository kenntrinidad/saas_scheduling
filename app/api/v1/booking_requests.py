# app/api/v1/booking_requests.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_owner
from app.schemas.booking_request import BookingRequestOut, BookingRequestApprove
from app.models.booking_request import BookingRequestStatus
from app.crud import booking_request as booking_request_crud
from app.crud import client as client_crud
from app.schemas.client import ClientCreate
from app.services.booking import create_appointment

router = APIRouter()


def _find_or_create_client(db: Session, full_name: str, phone: str | None, email: str | None):
    """Match an existing client by phone or email before creating a new one,
    so a repeat customer filling out the public form doesn't create a
    duplicate Client record each time. Default behavior — see note in the
    dev prompt about alternatives."""
    if email:
        matches = client_crud.get_clients(db, search=email)
        for c in matches:
            if c.email and c.email.lower() == email.lower():
                return c
    if phone:
        matches = client_crud.get_clients(db, search=phone)
        for c in matches:
            if c.contacts and c.contacts == phone:
                return c
    return client_crud.create_client(
        db, ClientCreate(full_name=full_name, contacts=phone, email=email)
    )


@router.get("/booking-requests", response_model=list[BookingRequestOut])
def list_requests(
    status: BookingRequestStatus | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_owner),
):
    return booking_request_crud.get_booking_requests(db, status)


@router.get("/booking-requests/pending-count")
def pending_count(db: Session = Depends(get_db), current_user=Depends(get_current_owner)):
    return {"count": booking_request_crud.count_pending_booking_requests(db)}


@router.post("/booking-requests/{request_id}/approve", response_model=BookingRequestOut)
def approve_booking_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_owner),
):
    req = booking_request_crud.get_booking_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=404, detail="Booking request not found")
    if req.status != BookingRequestStatus.pending:
        raise HTTPException(status_code=409, detail="This request has already been reviewed")

    # Directly approve the request without making an appointment schedule
    return booking_request_crud.approve_booking_request(db, req, reviewed_by=current_user.id)



@router.post("/booking-requests/{request_id}/reject", response_model=BookingRequestOut)
def reject_booking_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_owner),
):
    req = booking_request_crud.get_booking_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=404, detail="Booking request not found")
    if req.status != BookingRequestStatus.pending:
        raise HTTPException(status_code=409, detail="This request has already been reviewed")

    return booking_request_crud.reject_booking_request(db, req, reviewed_by=current_user.id)

@router.post("/booking-requests/{request_id}/approve", response_model=BookingRequestOut)
def approve_booking_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_owner),
):
    req = booking_request_crud.get_booking_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=404, detail="Booking request not found")
    if req.status != BookingRequestStatus.pending:
        raise HTTPException(status_code=409, detail="This request has already been reviewed")

    # Create or reuse Client
    client = _find_or_create_client(
        db,
        full_name=req.full_name,
        phone=getattr(req, "phone", None),
        email=getattr(req, "email", None),
    )

    if hasattr(req, "client_id"):
        req.client_id = client.id
    if req.notes and hasattr(client, "notes") and not client.notes:
        client.notes = req.notes
        db.add(client)

    # Pass request_id (int), not req (object)
    return booking_request_crud.approve_booking_request(
        db, request_id, reviewed_by=current_user.id
    )