from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.appointment import AppointmentStatus

class AppointmentCreate(
    BaseModel
):
    client_id: int
    staff_id: int
    appointment_date: datetime
    service_ids: list[int]

    @field_validator("service_ids")
    @classmethod
    def at_least_one_service(
        cls,
        v: list[int]) -> list[int]:
        if not v:
            raise ValueError("An appointment must have at least one service")
        return v

class AppointmentStatusUpdate(
    BaseModel
):
    status: AppointmentStatus

class ServiceLineOut(
    BaseModel
):
    service_id: int

    class Config:
        from_attributes = True

class AppointmentOut(
    BaseModel
):
    id: int
    client_id: int
    staff_id: int
    appointment_date: datetime
    status: AppointmentStatus
    created_at: datetime
    services: list[ServiceLineOut]

    class Config:
        from_attributes = True
