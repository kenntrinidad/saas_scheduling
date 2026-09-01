from fastapi import FastAPI
from app.core.database import engine, Base

# This is to create the tables (it will replace this with Alembic later) sabi nya

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAAS Scheduling API",
    description="Appointment Booking, Client Management, Staff Scheduling and Payments",
    version="0.1.0"
)

@app.get("/")
def root():
    return{
        "message": "Scheduling SAAS API is running"
    }

