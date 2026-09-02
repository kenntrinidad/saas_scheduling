from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentStatusUpdate
from app.services.booking import create_appointment
from app.crud import appointment as appointment_crud


router = APIRouter()


@router.post("/appointments", response_model=AppointmentOut, status_code=201)
def book_appointment(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return create_appointment(
            db,
            client_id=appointment_in.client_id,
            staff_id=appointment_in.staff_id,
            appointment_date=appointment_in.appointment_date,
            service_ids=appointment_in.service_ids,
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.patch("/appointments/{appointment_id}/status", response_model=AppointmentOut)
def update_status(
    appointment_id: int,
    status_in: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    appointment = appointment_crud.update_appointment_status(db, appointment_id, status_in.status)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment