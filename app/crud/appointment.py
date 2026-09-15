from datetime import datetime
from sqlalchemy.orm import Session
from app.models.appointment import Appointment, AppointmentStatus


def get_appointment(db: Session, appointment_id: int) -> Appointment | None:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def list_appointments(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    staff_id: int | None = None,
) -> list[Appointment]:
    query = db.query(Appointment)
    if date_from is not None:
        query = query.filter(Appointment.appointment_date >= date_from)
    if date_to is not None:
        query = query.filter(Appointment.appointment_date <= date_to)
    if staff_id is not None:
        query = query.filter(Appointment.staff_id == staff_id)
    return query.order_by(Appointment.appointment_date).all()


def update_appointment_status(db: Session, appointment_id: int, status: AppointmentStatus) -> Appointment | None:
    appointment = get_appointment(db, appointment_id)
    if appointment is None:
        return None
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return appointment