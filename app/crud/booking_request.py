# app/crud/booking_request.py
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Optional

from app.models.client import Client
from app.models.booking_request import BookingRequest, BookingRequestStatus
from app.schemas.booking_request import BookingRequestCreate, BookingRequestOut

def create_booking_request(
        db: Session,
        booking_request: BookingRequestCreate,
) -> BookingRequest:
    db_booking_request = BookingRequest(
        full_name=booking_request.full_name,
        phone=booking_request.phone,
        email=booking_request.email,
        preferred_time=booking_request.preferred_time,
        notes=booking_request.notes,
        status=BookingRequestStatus.pending,
    )

    db.add(db_booking_request)
    db.commit()
    db.refresh(db_booking_request)

    return db_booking_request

def get_booking_request(
        db: Session,
        booking_request_id: int,
) -> Optional[BookingRequest]:

    return (
        db.query(BookingRequest)
        .filter(BookingRequest.id == booking_request_id)
        .first()
    )

def get_booking_requests(
        db: Session,
        status: Optional[BookingRequestStatus] = None,
) -> list[BookingRequest]:
    query = db.query(BookingRequest)

    if status is not None:
        query = query.filter(BookingRequest.status == status)

    return (
        query.order_by(BookingRequest.created_at.desc())
        .all()
    )

def get_pending_booking_requests(
        db: Session,
) -> list[BookingRequest]:
    return (
        db.query(BookingRequest)
        .filter(
            BookingRequest.status == BookingRequestStatus.pending
        )
        .order_by(BookingRequest.created_at.desc())
        .all()
    )

def count_pending_booking_requests(
        db: Session,
) -> int:
    return (
        db.query(BookingRequest)
        .filter(
            BookingRequest.status == BookingRequestStatus.pending
        )
        .count()
    )

def approve_booking_request(
        db: Session,
        booking_request: BookingRequest,
        reviewed_by: int,
) -> BookingRequest:
    booking_request.status = BookingRequestStatus.approved
    booking_request.reviewed_at = datetime.now(timezone.utc)
    booking_request.reviewed_by = reviewed_by

    db.commit()
    db.refresh(booking_request)

    return booking_request

def reject_booking_request(
    db: Session,
    booking_request: BookingRequest,
    reviewed_by: int,
) -> BookingRequest:
    """
    Mark a booking request as rejected.
    """

    booking_request.status = BookingRequestStatus.rejected
    booking_request.reviewed_at = datetime.now().astimezone()
    booking_request.reviewed_by = reviewed_by

    db.commit()
    db.refresh(booking_request)

    return booking_request

def find_or_create_client_from_request(db: Session, req: BookingRequest) -> Client:
    client = None

    if req.email:
        client = db.query(Client).filter(Client.email == req.email).first()

    if client is None and req.phone:
        client = (
            db.query(Client)
            .filter(Client.contacts == req.phone)
            .first()
        )

    if client is None:
        client = Client(
            full_name=req.full_name,
            contacts=req.phone,   # Client column is contacts
            email=req.email,
            notes=req.notes,
        )
        db.add(client)
        db.flush()

    return client


def approve_booking_request(
    db: Session,
    booking_request: BookingRequest,
    reviewed_by: int | None = None,
) -> BookingRequest:
    """Approve a pending request and ensure a Client exists."""
    if booking_request.status != BookingRequestStatus.pending:
        raise ValueError("Only pending requests can be approved")

    client = find_or_create_client_from_request(db, booking_request)

    # Only if your BookingRequest model has client_id column
    if hasattr(booking_request, "client_id"):
        booking_request.client_id = client.id

    booking_request.status = BookingRequestStatus.approved
    booking_request.reviewed_at = datetime.now(timezone.utc)
    booking_request.reviewed_by = reviewed_by

    db.commit()
    db.refresh(booking_request)
    return booking_request