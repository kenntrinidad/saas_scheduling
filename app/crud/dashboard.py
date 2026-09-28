from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import date, datetime, time, timedelta
from app.models.staff import Staff
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.crud.schedule import get_schedules_for_staff_day, is_staff_off_on


def _naive(dt: datetime) -> datetime:
    """Strip timezone info for comparison purposes — same pattern as booking.py's
    conflict check, needed because DB columns are timezone-aware but query
    boundaries built from plain date objects are naive."""
    return dt.replace(tzinfo=None) if dt.tzinfo is not None else dt


def _day_bounds(d: date) -> tuple[datetime, datetime]:
    return datetime.combine(d, time.min), datetime.combine(d, time.max)


def _range_bounds(start: date, end: date) -> tuple[datetime, datetime]:
    return datetime.combine(start, time.min), datetime.combine(end, time.max)


# --- Staff availability -----------------------------------------------------

def get_staff_available_count(db: Session, target_date: date) -> int:
    """Staff with an active schedule for this day-of-week, minus anyone on time-off."""
    day_of_week = target_date.weekday()
    all_staff = db.query(Staff).filter(Staff.is_active == True).all()  # noqa: E712
    available = [
        s for s in all_staff
        if get_schedules_for_staff_day(db, s.id, day_of_week)
        and not is_staff_off_on(db, s.id, target_date)
    ]
    return len(available)


def get_staff_available_daily(db: Session, start_date: date, end_date: date) -> list[int]:
    """One count per day across the inclusive range."""
    counts = []
    current = start_date
    while current <= end_date:
        counts.append(get_staff_available_count(db, current))
        current += timedelta(days=1)
    return counts


def get_unique_staff_available_range(db: Session, start_date: date, end_date: date) -> int:
    """Unique staff available on at least one day in the range."""
    all_staff = db.query(Staff).filter(Staff.is_active == True).all()  # noqa: E712
    unique_ids: set[int] = set()
    current = start_date
    while current <= end_date:
        day_of_week = current.weekday()
        for s in all_staff:
            if s.id in unique_ids:
                continue
            if get_schedules_for_staff_day(db, s.id, day_of_week) and not is_staff_off_on(db, s.id, current):
                unique_ids.add(s.id)
        current += timedelta(days=1)
    return len(unique_ids)


def get_total_staff_count(db: Session) -> int:
    return db.query(Staff).filter(Staff.is_active == True).count()  # noqa: E712


# --- Confirmed appointments ---------------------------------------------------

def get_confirmed_appointments_count(db: Session, start: date, end: date) -> int:
    start_dt, end_dt = _range_bounds(start, end)
    return (
        db.query(Appointment)
        .filter(Appointment.status == AppointmentStatus.confirmed)
        .filter(Appointment.appointment_date >= _naive(start_dt))
        .filter(Appointment.appointment_date <= _naive(end_dt))
        .count()
    )


def get_unique_clients_with_confirmed(db: Session, start: date, end: date) -> int:
    start_dt, end_dt = _range_bounds(start, end)
    return (
        db.query(Appointment.client_id)
        .filter(Appointment.status == AppointmentStatus.confirmed)
        .filter(Appointment.appointment_date >= _naive(start_dt))
        .filter(Appointment.appointment_date <= _naive(end_dt))
        .distinct()
        .count()
    )


# --- Earnings ----------------------------------------------------------------

def get_earnings(db: Session, start: date, end: date) -> Decimal:
    start_dt, end_dt = _range_bounds(start, end)
    payments = (
        db.query(Payment)
        .filter(Payment.status == PaymentStatus.paid)
        .filter(Payment.paid_at >= _naive(start_dt))
        .filter(Payment.paid_at <= _naive(end_dt))
        .all()
    )
    return sum((p.amount for p in payments), Decimal("0"))