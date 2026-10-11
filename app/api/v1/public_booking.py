from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.booking_request import BookingRequestCreate, BookingRequestOut
from app.crud import booking_request as booking_request_crud

router = APIRouter()

@router.post("/public/booking-requests", response_model=BookingRequestOut, status_code=201)
def submit_booking_request(
    payload: BookingRequestCreate,
    db: Session = Depends(get_db)):
    return booking_request_crud.create_booking_request(db, payload
    )