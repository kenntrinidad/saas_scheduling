from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

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

# This is from initial Phase na gawa ko
class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=False)
    contact = Column(String)
    email = Column(String)
    social_media_link = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())