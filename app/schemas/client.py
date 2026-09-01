from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ClientBase(BaseModel):
    full_name: str
    contacts: Optional[str] = None
    email: Optional[EmailStr] = None
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    full_name: Optional[str] = None
    contacts: Optional[str] = None
    email: Optional[EmailStr] = None
    notes: Optional[str] = None


class ClientOut(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True