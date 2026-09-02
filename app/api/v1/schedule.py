from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_owner
from app.schemas.schedule import StaffScheduleCreate, StaffScheduleOut, StaffTimeOffCreate, StaffTimeOffOut
from app.crud import schedule as schedule_crud

router = APIRouter()


@router.post("/staff-schedules", response_model=StaffScheduleOut, status_code=201)
def create_staff_schedule(schedule_in: StaffScheduleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_owner)):
    return schedule_crud.create_schedule(db, schedule_in)


@router.post("/staff-time-off", response_model=StaffTimeOffOut, status_code=201)
def create_staff_time_off(time_off_in: StaffTimeOffCreate, db: Session = Depends(get_db), current_user=Depends(get_current_owner)):
    return schedule_crud.create_time_off(db, time_off_in)