from app.core.database import SessionLocal
from app.crud.user import create_user
from app.schemas.user import UserCreate

db = SessionLocal()
staff2_user = create_user(db, UserCreate(email="staff2@example.com", full_name="Test Staff 2", password="testpass123"), is_owner=False)
print(f"Created user id: {staff2_user.id}")
db.close()