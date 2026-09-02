from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class StaffBase(BaseModel):
    full_name: str
    contact: Optional[str] = None
    email: Optional[EmailStr] = None
    social_media_link: Optional[str] = None


class StaffCreate(StaffBase):
    user_id: int


class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[EmailStr] = None
    social_media_link: Optional[str] = None
    is_active: Optional[bool] = None


class StaffOut(StaffBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True