from pydantic import BaseModel
from decimal import Decimal
from datetime import date

class StaffWeekMonth(BaseModel):
    unique_available: int
    daily: list[int]

class StaffSummary(BaseModel):
    available_today: int
    daily: list[int]

class StaffSummary(BaseModel):
    available_today: int
    total_staff: int
    week: StaffWeekMonth
    month: StaffWeekMonth

class AppointmentSummary(BaseModel):
    confirmed_today: int
    confirmed_week: int
    confirmed_month: int
    unique_clients_today: int
    unique_clients_week: int
    unique_clients_month: int

class EarningsSummary(BaseModel):
    today: Decimal
    week: Decimal
    month: Decimal

class DashboardSummaryOut(BaseModel):
    staff: StaffSummary
    appointments: AppointmentSummary
    earnings: EarningsSummary

class DashboardEarningsOut(BaseModel):
    start_date: date
    end_date: date
    total_earnings: Decimal