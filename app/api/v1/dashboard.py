from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.api.deps import get_db, get_current_user
from app.crud import dashboard as dashboard_crud
from app.schemas.dashboard import DashboardSummaryOut, DashboardEarningsOut

router = APIRouter()


def _week_bounds(today: date) -> tuple[date, date]:
    start = today - timedelta(days=today.weekday())  # Monday
    end = start + timedelta(days=6)  # Sunday
    return start, end


def _month_bounds(today: date) -> tuple[date, date]:
    start = today.replace(day=1)
    if today.month == 12:
        next_month_start = today.replace(year=today.year + 1, month=1, day=1)
    else:
        next_month_start = today.replace(month=today.month + 1, day=1)
    end = next_month_start - timedelta(days=1)
    return start, end


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()  # TODO: use Asia/Manila-aware "today" once timezone handling is added project-wide
    week_start, week_end = _week_bounds(today)
    month_start, month_end = _month_bounds(today)

    staff_summary = {
        "available_today": dashboard_crud.get_staff_available_count(db, today),
        "total_staff": dashboard_crud.get_total_staff_count(db),
        "week": {
            "unique_available": dashboard_crud.get_unique_staff_available_range(db, week_start, week_end),
            "daily": dashboard_crud.get_staff_available_daily(db, week_start, week_end),
        },
        "month": {
            "unique_available": dashboard_crud.get_unique_staff_available_range(db, month_start, month_end),
            "daily": dashboard_crud.get_staff_available_daily(db, month_start, month_end),
        },
    }

    appointments_summary = {
        "confirmed_today": dashboard_crud.get_confirmed_appointments_count(db, today, today),
        "confirmed_week": dashboard_crud.get_confirmed_appointments_count(db, week_start, week_end),
        "confirmed_month": dashboard_crud.get_confirmed_appointments_count(db, month_start, month_end),
        "unique_clients_today": dashboard_crud.get_unique_clients_with_confirmed(db, today, today),
        "unique_clients_week": dashboard_crud.get_unique_clients_with_confirmed(db, week_start, week_end),
        "unique_clients_month": dashboard_crud.get_unique_clients_with_confirmed(db, month_start, month_end),
    }

    earnings_summary = {
        "today": dashboard_crud.get_earnings(db, today, today),
        "week": dashboard_crud.get_earnings(db, week_start, week_end),
        "month": dashboard_crud.get_earnings(db, month_start, month_end),
    }

    return DashboardSummaryOut(staff=staff_summary, appointments=appointments_summary, earnings=earnings_summary)


@router.get("/dashboard/earnings", response_model=DashboardEarningsOut)
def dashboard_earnings(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if start_date > end_date:
        raise HTTPException(status_code=422, detail="start_date must not be after end_date")

    total = dashboard_crud.get_earnings(db, start_date, end_date)
    return DashboardEarningsOut(start_date=start_date, end_date=end_date, total_earnings=total)