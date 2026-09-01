from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StaffBase(BaseModel):
    full_name: str
    contact: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True

class StaffCreate(StaffBase):
    pass

class StaffUpdate(StaffBase):
    full_name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class StaffOut(StaffBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True