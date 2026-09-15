from datetime import datetime
from sqlalchemy.orm import Session
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate


def create_payment(db: Session, payment_in: PaymentCreate) -> Payment:
    payment = Payment(
        client_id=payment_in.client_id,
        appointment_id=payment_in.appointment_id,
        amount=payment_in.amount,
        method=payment_in.method,
        notes=payment_in.notes,
        status=PaymentStatus.paid,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def list_payments(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    method: str | None = None,
) -> list[Payment]:
    query = db.query(Payment)
    if date_from is not None:
        query = query.filter(Payment.paid_at >= date_from)
    if date_to is not None:
        query = query.filter(Payment.paid_at <= date_to)
    if method is not None:
        query = query.filter(Payment.method == method)
    return query.order_by(Payment.paid_at.desc()).all()