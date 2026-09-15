from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from app.models.payment import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    client_id: int
    appointment_id: int | None = None
    amount: Decimal
    method: PaymentMethod
    notes: str | None = None


class PaymentOut(BaseModel):
    id: int
    client_id: int
    appointment_id: int | None
    amount: Decimal
    method: PaymentMethod
    status: PaymentStatus
    notes: str | None
    paid_at: datetime

    class Config:
        from_attributes = True