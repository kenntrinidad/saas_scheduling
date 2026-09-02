from sqlalchemy.orm import Session
from app.models.service import Service
from app.schemas.service import ServiceCreate


def get_service(db: Session, service_id: int) -> Service | None:
    return db.query(Service).filter(Service.id == service_id).first()


def get_services(db: Session, skip: int = 0, limit: int = 100) -> list[Service]:
    return db.query(Service).filter(Service.is_active == True).offset(skip).limit(limit).all()  # noqa: E712


def create_service(db: Session, service_in: ServiceCreate) -> Service:
    service = Service(**service_in.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service