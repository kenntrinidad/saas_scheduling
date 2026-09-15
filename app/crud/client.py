from sqlalchemy.orm import Session
from app.models.client import Client
from app.models.appointment import Appointment
from app.schemas.client import ClientCreate, ClientUpdate


def get_client(db: Session, client_id: int) -> Client | None:
    return db.query(Client).filter(Client.id == client_id).first()


def get_clients(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    tag: str | None = None,
) -> list[Client]:
    query = db.query(Client)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Client.full_name.ilike(pattern))
            | (Client.contacts.ilike(pattern))
            | (Client.email.ilike(pattern))
        )
    if tag:
        query = query.filter(Client.tags.ilike(f"%{tag}%"))
    return query.offset(skip).limit(limit).all()


def create_client(db: Session, client_in: ClientCreate) -> Client:
    client = Client(**client_in.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def update_client(db: Session, client_id: int, client_in: ClientUpdate) -> Client | None:
    client = get_client(db, client_id)
    if client is None:
        return None
    dump = client_in.model_dump(exclude_unset=True)
    #print("DEBUG dump:", dump)  # <-- add this line
    for field, value in dump.items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


def get_client_appointments(db: Session, client_id: int) -> list[Appointment]:
    return (
        db.query(Appointment)
        .filter(Appointment.client_id == client_id)
        .order_by(Appointment.appointment_date.desc())
        .all()
    )

