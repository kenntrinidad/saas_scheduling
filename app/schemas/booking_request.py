from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional
from datetime import datetime
from app.models.booking_request import BookingRequestStatus


class BookingRequestCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_time: datetime
    notes: Optional[str] = None

    @model_validator(mode="after")
    def require_contact_method(self):
        if not self.phone and not self.email:
            raise ValueError("Provide at least a phone number or an email address")
        return self


class BookingRequestOut(BaseModel):
    id: int
    full_name: str
    phone: Optional[str]
    email: Optional[str]
    preferred_time: datetime
    notes: Optional[str]
    status: BookingRequestStatus
    created_at: datetime
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True


class BookingRequestApprove(BaseModel):
    service_id: Optional[int] = None
    staff_id: Optional[int] = None