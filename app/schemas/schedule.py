from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, time, datetime


class StaffScheduleBase(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time

    @field_validator("day_of_week")
    @classmethod
    def validate_key(cls, v: int) -> int:
        if not 0 <= v <= 6:
            raise ValueError("day_of_week must be 0 (Monday) through 6 (Sunday)")
        return v


class StaffScheduleCreate(StaffScheduleBase):
    staff_id: int


class StaffScheduleOut(StaffScheduleBase):
    id: int
    staff_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StaffTimeOffBase(BaseModel):
    date: date
    reason: Optional[str] = None


class StaffTimeOffCreate(StaffTimeOffBase):
    staff_id: int


class StaffTimeOffOut(StaffTimeOffBase):
    id: int
    staff_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TimeSlot(BaseModel):
    start: time
    end: time