from sqlalchemy.orm import Session
from decimal import Decimal
from app.models.appointment import Appointment
from app.models.payment import Payment, PaymentStatus
from app.crud import service as service_crud


def calculate_total_due(db: Session, appointment: Appointment) -> Decimal:
    total = Decimal("0")
    for link in appointment.services:
        service = service_crud.get_service(db, link.service_id)
        total += service.price
    return total


def calculate_total_paid(db: Session, appointment_id: int) -> Decimal:
    payments = (
        db.query(Payment)
        .filter(Payment.appointment_id == appointment_id, Payment.status == PaymentStatus.paid)
        .all()
    )
    return sum((p.amount for p in payments), Decimal("0"))