from sqlalchemy.orm import Session
from datetime import date, datetime, time
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.schemas.payment import PaymentCreate


def get_payment(db: Session, payment_id: int) -> Payment | None:
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payments_for_appointment(db: Session, appointment_id: int) -> list[Payment]:
    return db.query(Payment).filter(Payment.appointment_id == appointment_id).all()


def create_payment(db: Session, payment_in: PaymentCreate) -> Payment:
    payment = Payment(
        client_id=payment_in.client_id,
        appointment_id=payment_in.appointment_id,
        amount=payment_in.amount,
        method=payment_in.method,
        notes=payment_in.notes,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def update_payment_status(db: Session, payment_id: int, status: PaymentStatus) -> Payment | None:
    payment = get_payment(db, payment_id)
    if payment is None:
        return None
    payment.status = status
    db.commit()
    db.refresh(payment)
    return payment


def get_payments_filtered(
    db: Session,
    start_date: date | None = None,
    end_date: date | None = None,
    method: PaymentMethod | None = None,
) -> list[Payment]:
    query = db.query(Payment)
    if start_date:
        query = query.filter(Payment.paid_at >= datetime.combine(start_date, time.min))
    if end_date:
        query = query.filter(Payment.paid_at <= datetime.combine(end_date, time.max))
    if method:
        query = query.filter(Payment.method == method)
    return query.order_by(Payment.paid_at.desc()).all()


def get_sales_between(db: Session, start_date: date, end_date: date) -> list[Payment]:
    return get_payments_filtered(db, start_date, end_date)