from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, time
from app.crud.schedule import get_schedules_for_staff_day, is_staff_off_on
from app.crud import service as service_crud
from app.models.appointment import Appointment
from app.services.booking import ACTIVE_STATUSES
from app.schemas.schedule import TimeSlot


def _booked_intervals(db: Session, staff_id: int, target_date: date) -> list[tuple[time, time]]:
    day_start = datetime.combine(target_date, time.min)
    day_end = datetime.combine(target_date, time.max)
    existing = (
        db.query(Appointment)
        .filter(
            Appointment.staff_id == staff_id,
            Appointment.status.in_(ACTIVE_STATUSES),
            Appointment.appointment_date >= day_start,
            Appointment.appointment_date <= day_end,
        )
        .all()
    )
    intervals = []
    for appt in existing:
        total_minutes = sum(
            service_crud.get_service(db, link.service_id).duration_minutes
            for link in appt.services
        )
        end_dt = appt.appointment_date + timedelta(minutes=total_minutes)
        intervals.append((appt.appointment_date.time(), end_dt.time()))
    return intervals


def get_available_slots(db: Session, staff_id: int, service_id: int, target_date: date) -> list[TimeSlot]:
    if is_staff_off_on(db, staff_id, target_date):
        return []

    service = service_crud.get_service(db, service_id)
    if service is None:
        raise ValueError(f"Service {service_id} not found")

    day_of_week = target_date.weekday()
    working_blocks = get_schedules_for_staff_day(db, staff_id, day_of_week)
    if not working_blocks:
        return []

    duration = timedelta(minutes=service.duration_minutes)
    booked = _booked_intervals(db, staff_id, target_date)
    slots: list[TimeSlot] = []

    for block in working_blocks:
        cursor = datetime.combine(target_date, block.start_time)
        block_end = datetime.combine(target_date, block.end_time)

        while cursor + duration <= block_end:
            slot_start = cursor.time()
            slot_end = (cursor + duration).time()
            overlaps_booking = any(slot_start < b_end and b_start < slot_end for b_start, b_end in booked)
            if not overlaps_booking:
                slots.append(TimeSlot(start=slot_start, end=slot_end))
            cursor += duration

    return slots