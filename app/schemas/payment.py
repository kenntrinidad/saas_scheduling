from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.payment import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    client_id: int
    appointment_id: Optional[int] = None
    amount: Decimal
    method: PaymentMethod
    notes: Optional[str] = None


class PaymentStatusUpdate(BaseModel):
    status: PaymentStatus


class PaymentOut(BaseModel):
    id: int
    client_id: int
    appointment_id: Optional[int]
    amount: Decimal
    method: PaymentMethod
    status: PaymentStatus
    notes: Optional[str]
    paid_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentBillingOut(BaseModel):
    appointment_id: int
    total_due: Decimal
    total_paid: Decimal
    balance: Decimal
    payments: list[PaymentOut]