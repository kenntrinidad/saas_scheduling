from sqlalchemy.orm import Session
from app.models.staff_schedule import StaffSchedule, StaffTimeOff
from app.schemas.schedule import StaffScheduleCreate, StaffTimeOffCreate
from datetime import date


def create_schedule(db: Session, schedule_in: StaffScheduleCreate) -> StaffSchedule:
    schedule = StaffSchedule(**schedule_in.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


def get_schedules_for_staff_day(db: Session, staff_id: int, day_of_week: int) -> list[StaffSchedule]:
    return (
        db.query(StaffSchedule)
        .filter(
            StaffSchedule.staff_id == staff_id,
            StaffSchedule.day_of_week == day_of_week,
            StaffSchedule.is_active == True,  # noqa: E712
        )
        .all()
    )


def create_time_off(db: Session, time_off_in: StaffTimeOffCreate) -> StaffTimeOff:
    time_off = StaffTimeOff(**time_off_in.model_dump())
    db.add(time_off)
    db.commit()
    db.refresh(time_off)
    return time_off


def is_staff_off_on(db: Session, staff_id: int, target_date: date) -> bool:
    return (
        db.query(StaffTimeOff)
        .filter(StaffTimeOff.staff_id == staff_id, StaffTimeOff.date == target_date)
        .first()
        is not None
    )