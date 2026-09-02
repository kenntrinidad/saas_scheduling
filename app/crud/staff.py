from sqlalchemy.orm import Session
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate


def get_staff(db: Session, staff_id: int) -> Staff | None:
    return db.query(Staff).filter(Staff.id == staff_id).first()


def get_all_staff(db: Session, skip: int = 0, limit: int = 100) -> list[Staff]:
    return db.query(Staff).offset(skip).limit(limit).all()


def create_staff(db: Session, staff_in: StaffCreate) -> Staff:
    staff = Staff(**staff_in.model_dump())
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


def update_staff(db: Session, staff_id: int, staff_in: StaffUpdate) -> Staff | None:
    staff = get_staff(db, staff_id)
    if staff is None:
        return None
    for field, value in staff_in.model_dump(exclude_unset=True).items():
        setattr(staff, field, value)
    db.commit()
    db.refresh(staff)
    return staff