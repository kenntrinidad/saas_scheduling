from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.payment import PaymentCreate, PaymentOut
from app.crud import payment as payment_crud

router = APIRouter()


@router.get("/payments", response_model=list[PaymentOut])
def list_payments(
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
    method: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return payment_crud.list_payments(db, date_from=date_from, date_to=date_to, method=method)


@router.post("/payments", response_model=PaymentOut, status_code=201)
def record_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return payment_crud.create_payment(db, payment_in)