from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime, Enum, Text
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    gcash = "gcash"
    card = "card"


class PaymentStatus(str, enum.Enum):
    paid = "paid"
    refunded = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.paid, nullable=False)
    notes = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True), server_default=func.now())