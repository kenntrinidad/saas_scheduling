import pytest
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.v1.auth import reset_password, router as auth_router
from app.core.database import Base
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import PasswordResetRequest


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


def test_reset_password_updates_authenticated_users_password(db):
    user = User(email="owner@example.com", hashed_password=hash_password("old-password"))
    db.add(user)
    db.commit()

    result = reset_password(
        PasswordResetRequest(
            current_password="old-password",
            new_password="new-password",
        ),
        db,
        user,
    )

    assert result == {"message": "Password reset successfully"}
    assert verify_password("new-password", user.hashed_password)
    assert not verify_password("old-password", user.hashed_password)


def test_reset_password_rejects_incorrect_current_password(db):
    user = User(email="owner@example.com", hashed_password=hash_password("old-password"))
    db.add(user)
    db.commit()
    original_hash = user.hashed_password

    with pytest.raises(HTTPException) as error:
        reset_password(
            PasswordResetRequest(
                current_password="incorrect-password",
                new_password="new-password",
            ),
            db,
            user,
        )

    assert error.value.status_code == 400
    assert user.hashed_password == original_hash


def test_reset_password_is_in_swagger_and_requires_bearer_auth():
    app = FastAPI()
    app.include_router(auth_router, prefix="/api/v1/auth")

    openapi = app.openapi()
    operation = openapi["paths"]["/api/v1/auth/reset-password"]["post"]

    security_schemes = openapi["components"]["securitySchemes"]
    assert any(
        security_schemes.get(scheme, {}).get("type") == "oauth2"
        for requirement in operation["security"]
        for scheme in requirement
    )
    assert operation["requestBody"]["required"] is True