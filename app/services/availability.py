from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, time
from app.crud.schedule import get_schedule_for_staff_day, is_staff_off_on
from app.crud import service as service_crud
from app.schemas.schedule import TimeSlot

def get_availability_slots(db: Session, staff_id: int, service_id: int, target_date: date) -> list[TimeSlot]:
    if is_staff_off_on(db, staff_id, target_date):
        return[]

    service = service_crud.get_service(db, service_id)
    if service is None:
        raise ValueError(f"Service {service_id} not found")

    day_of_week = target_date.weekday()
    working_blocks = get_schedule_for_staff_day(db, staff_id, day_of_week)
    if not working_blocks:
        return []

    duration = timedelta(minutes=service.duration_minutes)
    slots: list[TimeSlot] = []

    for block in working_blocks:
        cursor = datetime.combine(target_date, block.start_time)
        block_end = datetime.combine(target_date, block.end_time)

        while cursor + duration <= block_end:
            slot_start = cursor.time()
            slot_end = (cursor + duration).time()
            slots.append(TimeSlot(start=slot_start, end=slot_end))
            cursor += duration

    return slots