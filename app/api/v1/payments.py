from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.api.deps import get_db, get_current_user, get_current_owner
from app.schemas.payment import PaymentCreate, PaymentOut, PaymentStatusUpdate, AppointmentBillingOut
from app.crud import payment as payment_crud
from app.crud.appointment import get_appointment
from app.models.payment import PaymentMethod
from app.services import billing

router = APIRouter()


@router.get("/payments", response_model=list[PaymentOut])
def list_payments(
    from_: date | None = Query(None, alias="from"),
    to: date | None = Query(None),
    method: PaymentMethod | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return payment_crud.get_payments_filtered(db, from_, to, method)


@router.post("/payments", response_model=PaymentOut, status_code=201)
def record_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if payment_in.appointment_id is not None:
        appointment = get_appointment(db, payment_in.appointment_id)
        if appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
    return payment_crud.create_payment(db, payment_in)


@router.get("/appointments/{appointment_id}/billing", response_model=AppointmentBillingOut)
def read_appointment_billing(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    appointment = get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    total_due = billing.calculate_total_due(db, appointment)
    payments = payment_crud.get_payments_for_appointment(db, appointment_id)
    total_paid = sum((p.amount for p in payments if p.status.value == "paid"), type(total_due)("0"))

    return AppointmentBillingOut(
        appointment_id=appointment_id,
        total_due=total_due,
        total_paid=total_paid,
        balance=total_due - total_paid,
        payments=payments,
    )


@router.patch("/payments/{payment_id}/status", response_model=PaymentOut)
def update_status(
    payment_id: int,
    status_in: PaymentStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_owner),
):
    payment = payment_crud.update_payment_status(db, payment_id, status_in.status)
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment