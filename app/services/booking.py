from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.appointment import Appointment, AppointmentService, AppointmentStatus
from app.crud import service as service_crud

# Statuses that still "occupy" a time slot — cancelled/no-show appointments
# free up that slot for rebooking.
ACTIVE_STATUSES = (AppointmentStatus.pending, AppointmentStatus.confirmed, AppointmentStatus.completed)

def _naive(dt: datetime) -> datetime:
    """Strip timezone info for comparison purposes — this app assumes a
    single salon timezone throughout, so relative ordering is all that
    matters here, not absolute UTC offset."""
    return dt.replace(tzinfo=None) if dt.tzinfo is not None else dt

def _total_duration_minutes(db: Session, service_ids: list[int]) -> int:
    total = 0
    for sid in service_ids:
        svc = service_crud.get_service(db, sid)
        if svc is None:
            raise ValueError(f"Service {sid} not found")
        total += svc.duration_minutes
    return total


def _has_conflict(db: Session, *, staff_id: int | None, client_id: int | None,
                   start: datetime, end: datetime, exclude_appointment_id: int | None = None) -> bool:
    start = _naive(start)
    end = _naive(end)

    query = db.query(Appointment).filter(
        Appointment.status.in_(ACTIVE_STATUSES),
    )
    if staff_id is not None:
        query = query.filter(Appointment.staff_id == staff_id)
    if client_id is not None:
        query = query.filter(Appointment.client_id == client_id)
    if exclude_appointment_id is not None:
        query = query.filter(Appointment.id != exclude_appointment_id)

    for existing in query.all():
        existing_start = _naive(existing.appointment_date)
        existing_duration = sum(
            service_crud.get_service(db, link.service_id).duration_minutes
            for link in existing.services
        )
        existing_end = existing_start + timedelta(minutes=existing_duration)
        if existing_start < end and start < existing_end:
            return True
    return False


def create_appointment(db: Session, *, client_id: int, staff_id: int,
                        appointment_date: datetime, service_ids: list[int]) -> Appointment:
    duration = _total_duration_minutes(db, service_ids)
    end = appointment_date + timedelta(minutes=duration)

    if _has_conflict(db, staff_id=staff_id, client_id=None, start=appointment_date, end=end):
        raise ValueError("This staff member already has an appointment that overlaps this time")
    if _has_conflict(db, staff_id=None, client_id=client_id, start=appointment_date, end=end):
        raise ValueError("This client already has an appointment that overlaps this time")

    appointment = Appointment(
        client_id=client_id,
        staff_id=staff_id,
        appointment_date=appointment_date,
        status=AppointmentStatus.pending,
    )
    db.add(appointment)
    db.flush()  # get appointment.id before committing, for the join rows

    for sid in service_ids:
        db.add(AppointmentService(appointment_id=appointment.id, service_id=sid))

    db.commit()
    db.refresh(appointment)
    return appointment