from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class ServiceOut(ServiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True