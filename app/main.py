from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

from app.models import user, staff, client, service, staff_schedule, appointment, payment  # noqa: F401
from app.api.v1 import (
    auth,
    availability,
    clients,
    staff as staff_router,
    services,
    schedule,
    appointments,
    payments,
    reports,
    health,
    dashboard,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAAS Scheduling API",
    description="Appointment Booking, Client Management, Staff Scheduling and Payments",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://saas-scheduling.vercel.app",
    ],
    allow_origin_regex=r"https://saas-scheduling[a-z0-9-]*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(availability.router, prefix="/api/v1", tags=["Availability"])
app.include_router(services.router, prefix="/api/v1", tags=["Services"])
app.include_router(clients.router, prefix="/api/v1", tags=["Clients"])
app.include_router(staff_router.router, prefix="/api/v1", tags=["Staff"])
app.include_router(schedule.router, prefix="/api/v1", tags=["Schedule"])
app.include_router(appointments.router, prefix="/api/v1", tags=["Appointments"])
app.include_router(payments.router, prefix="/api/v1", tags=["Payments"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])


@app.get("/")
def root():
    return {
        "message": "Scheduling SAAS API is running"
    }