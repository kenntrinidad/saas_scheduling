from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import user, staff, client, service, staff_schedule, appointment  # noqa: F401

from app.api.v1 import auth, availability, clients, staff as staff_router, services, schedule, appointments
from fastapi.middleware.cors import CORSMiddleware

from app.models import user, staff, client, service, staff_schedule, appointment, payment  # noqa: F401
from app.api.v1 import auth, availability, clients, staff as staff_router, services, schedule, appointments, payments, reports


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAAS Scheduling API",
    description="Appointment Booking, Client Management, Staff Scheduling and Payments",
    version="0.1.0"
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(availability.router, prefix="/api/v1", tags=["Availability"])
app.include_router(services.router, prefix="/api/v1", tags=["Services"])
app.include_router(clients.router, prefix="/api/v1", tags=["Clients"])
app.include_router(staff_router.router, prefix="/api/v1", tags=["Staff"])
app.include_router(schedule.router, prefix="/api/v1", tags=["Schedule"])
app.include_router(appointments.router, prefix="/api/v1", tags=["Appointments"])
app.include_router(payments.router, prefix="/api/v1", tags=["Payments"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Scheduling SAAS API is running"
    }