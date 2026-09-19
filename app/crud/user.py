from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
import uuid


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: UserCreate, is_owner: bool = False) -> User:
    user = User(
        id=str(uuid.uuid4()),
        username=user_in.email.split("@")[0],  # simple default username
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=hash_password(user_in.password),
        role="admin" if is_owner else "user",
        status="active",
        is_owner=is_owner,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user