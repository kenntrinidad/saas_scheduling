from sqlalchemy.orm import Session
from app.models.appointment import Appointment, AppointmentStatus


def get_appointment(db: Session, appointment_id: int) -> Appointment | None:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def update_appointment_status(db: Session, appointment_id: int, status: AppointmentStatus) -> Appointment | None:
    appointment = get_appointment(db, appointment_id)
    if appointment is None:
        return None
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return appointment