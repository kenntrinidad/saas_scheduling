import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User
from app.models.staff import Staff
from app.models.client import Client
from app.models.service import Service
from app.models.appointment import Appointment, AppointmentService, AppointmentStatus
from app.crud.client import get_clients, get_client_appointments
from app.schemas.client import ClientUpdate
from app.crud.client import update_client


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def seed_clients(db):
    maria = Client(full_name="Maria Santos", contacts="09171234567", email="maria@example.com", tags="VIP,Regular")
    juan = Client(full_name="Juan Dela Cruz", contacts="09179876543", tags="New")
    db.add_all([maria, juan])
    db.commit()
    return {"maria": maria, "juan": juan}


def test_search_matches_case_insensitive_partial_name(db, seed_clients):
    results = get_clients(db, search="maria")
    assert len(results) == 1
    assert results[0].full_name == "Maria Santos"


def test_search_matches_contacts(db, seed_clients):
    results = get_clients(db, search="09179876543")
    assert len(results) == 1
    assert results[0].full_name == "Juan Dela Cruz"


def test_search_no_match_returns_empty(db, seed_clients):
    results = get_clients(db, search="nonexistent")
    assert results == []


def test_tag_filter_matches_partial(db, seed_clients):
    results = get_clients(db, tag="VIP")
    assert len(results) == 1
    assert results[0].full_name == "Maria Santos"


def test_update_client_preferences_and_tags(db, seed_clients):
    updated = update_client(
        db,
        seed_clients["maria"].id,
        ClientUpdate(preferences="Prefers window seat", tags="VIP,Regular,Allergic to latex"),
    )
    assert updated.preferences == "Prefers window seat"
    assert "Allergic to latex" in updated.tags


def test_appointment_history_returns_only_this_clients_appointments(db, seed_clients):
    staff_user = User(email="staff@test.com", full_name="Staff", hashed_password="x", is_owner=False)
    db.add(staff_user)
    db.commit()

    staff = Staff(user_id=staff_user.id, full_name="Test Staff")
    service = Service(name="Haircut", duration_minutes=30, price=200)
    db.add_all([staff, service])
    db.commit()

    appt1 = Appointment(client_id=seed_clients["maria"].id, staff_id=staff.id,
                         appointment_date=datetime(2026, 9, 7, 9, 0), status=AppointmentStatus.pending)
    appt2 = Appointment(client_id=seed_clients["juan"].id, staff_id=staff.id,
                         appointment_date=datetime(2026, 9, 8, 9, 0), status=AppointmentStatus.pending)
    db.add_all([appt1, appt2])
    db.commit()

    history = get_client_appointments(db, seed_clients["maria"].id)
    assert len(history) == 1
    assert history[0].client_id == seed_clients["maria"].id