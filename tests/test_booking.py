# tests/test_booking.py
import pytest
from datetime import datetime, time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.staff import Staff
from app.models.service import Service
from app.models.client import Client
from app.services.booking import create_appointment


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def seed(db):
    client = Client(full_name="Test Client")
    staff = Staff(full_name="Test Staff", user_id=1)
    service = Service(name="Haircut", duration_minutes=30, price=200)
    db.add_all([client, staff, service])
    db.commit()
    return {"client": client, "staff": staff, "service": service}


def test_create_appointment_success(db, seed):
    appt = create_appointment(
        db,
        client_id=seed["client"].id,
        staff_id=seed["staff"].id,
        appointment_date=datetime(2026, 9, 7, 9, 0),  # a Monday
        service_ids=[seed["service"].id],
    )
    assert appt.id is not None
    assert appt.status.value == "pending"
    assert len(appt.services) == 1


def test_staff_double_booking_rejected(db, seed):
    create_appointment(
        db, client_id=seed["client"].id, staff_id=seed["staff"].id,
        appointment_date=datetime(2026, 9, 7, 9, 0), service_ids=[seed["service"].id],
    )
    with pytest.raises(ValueError, match="staff member"):
        create_appointment(
            db, client_id=seed["client"].id, staff_id=seed["staff"].id,
            appointment_date=datetime(2026, 9, 7, 9, 15),  # overlaps
            service_ids=[seed["service"].id],
        )


def test_client_double_booking_rejected(db, seed):
    other_staff = Staff(full_name="Other Staff", user_id=2)
    db.add(other_staff)
    db.commit()

    create_appointment(
        db, client_id=seed["client"].id, staff_id=seed["staff"].id,
        appointment_date=datetime(2026, 9, 7, 9, 0), service_ids=[seed["service"].id],
    )
    with pytest.raises(ValueError, match="client"):
        create_appointment(
            db, client_id=seed["client"].id, staff_id=other_staff.id,
            appointment_date=datetime(2026, 9, 7, 9, 15),  # overlaps, different staff
            service_ids=[seed["service"].id],
        )


def test_non_overlapping_bookings_both_succeed(db, seed):
    create_appointment(
        db, client_id=seed["client"].id, staff_id=seed["staff"].id,
        appointment_date=datetime(2026, 9, 7, 9, 0), service_ids=[seed["service"].id],
    )
    # starts exactly when the first one ends (30 min later) — should NOT conflict
    appt2 = create_appointment(
        db, client_id=seed["client"].id, staff_id=seed["staff"].id,
        appointment_date=datetime(2026, 9, 7, 9, 30), service_ids=[seed["service"].id],
    )
    assert appt2.id is not None