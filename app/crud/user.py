from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: UserCreate, is_owner: bool = False) -> User:
    """is_owner is a plain function argument, never read from user_in —
    that's the fix from the UserCreate schema discussion earlier: the
    caller (your endpoint code) decides this, not the request body."""
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        is_owner=is_owner,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user