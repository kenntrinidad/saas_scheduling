from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int                          # ← change from str to int
    is_active: bool
    is_owner: bool
    created_at: datetime | None = None

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str