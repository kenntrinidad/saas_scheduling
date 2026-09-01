from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.api.deps import get_db
from app.services.availability import get_available_slots
from app.schemas.schedule import TimeSlot

router = APIRouter()

@router.get("/availability", response_model=list[TimeSlot])
def read_availability(
    staff_id: int,
    service_id: int,
    target_date: date,
    db: Session = Depends(get_db), 
):
    try:
        return get_available_slots(db, staff_id, service_id, target_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))