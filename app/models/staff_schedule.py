from sqlalchemy import Column, Integer, String, Time, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class StaffSchedule(Base):
    __tablename__ = "staff_schedules"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StaffTimeOff(Base):
    __tablename__ = "staff_time_off"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    date = Column(Date, nullable=False)
    reason = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())