
Run environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# To Test in Pytest
pytest tests/test_booking.py -v
pytest tests/test_client.py -v

# To check where running
netstat -ano | findstr :8000

# Sample Curl
curl.exe -X POST "http://127.0.0.1:8000/api/v1/auth/register" -H "Content-Type: application/json" -d '{\"email\":\"trinidad@example.com\",\"full_name\":\"rstrinidad\",\"password\":\"12345678\"}'

curl.exe -X POST "http://127.0.0.1:8000/api/v1/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=password&username=trinidad@example.com&password=12345678"

Token:
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0cmluaWRhZEBleGFtcGxlLmNvbSIsImV4cCI6MTc4ODM0MDEwNX0._QyDVDGB4ol8iq4oMCNspWPk5Op-wejYSsftIAXc73A"

curl.exe -X POST "http://127.0.0.1:8000/api/v1/services" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{\"name\":\"Haircut\",\"duration_minutes\":30,\"price\":200,\"is_active\":true}'

127.0.0.1:8000/docs

Python Version should be 3.12 only

Phase 1
> created core
    > config.py
    > database.py
    > security.py
    > services.py
    > staff.py
    > user.py
> main.py

Issue:
> IR1 - Issue in running the environment
  - Findings: 
  -- recommended: Python 3.12
  -- config.py is config,py


Phase 1 Continuation
Step 7: Pydantic Schemas + Authentication
1. Pydantic Schemas
app/schemas/user.py
app/schemas/staff.py
app/schemas/client.py
app/crud/user.py


##Update from Claude
> app/models/user.py

Phase 2 - Staff Scheduling
done app/models/staff_schedule.py
done app/schemas/schedule.py
done app/services/availability.py
done app/api/v1/availability.py

#Return to Step 7
update app/models/client.py
done the Step7

Proceed Phase 3

# Salon / Barbershop / Spa Scheduling SaaS

A multi-tenant-ready appointment scheduling API for salons, barbershops, and
spas — appointment booking, staff scheduling, client management, and (soon)
payments. Built manually, phase by phase, to learn the architecture rather
than having it generated wholesale.

## Tech Stack

- **Python 3.14**
- **FastAPI** — web framework
- **PostgreSQL** — database
- **SQLAlchemy** — ORM
- **Pydantic v2** — request/response validation
- **passlib + bcrypt** — password hashing
- **python-jose** — JWT auth
- **pytest** — testing

## Architecture

```
saas_scheduling/                 <- project root
├── app/
│   ├── core/
│   │   ├── config.py            <- Settings (reads .env)
│   │   ├── database.py          <- SQLAlchemy engine/session/Base
│   │   └── security.py          <- password hashing, JWT create/decode
│   ├── models/                  <- SQLAlchemy models (DB tables)
│   │   ├── user.py
│   │   ├── staff.py
│   │   ├── client.py
│   │   ├── service.py
│   │   ├── staff_schedule.py    <- StaffSchedule + StaffTimeOff
│   │   └── appointment.py       <- Appointment + AppointmentService + AppointmentStatus enum
│   ├── schemas/                 <- Pydantic request/response models
│   │   ├── user.py
│   │   ├── staff.py
│   │   ├── client.py
│   │   ├── service.py
│   │   ├── schedule.py          <- StaffSchedule + StaffTimeOff schemas, TimeSlot
│   │   └── appointment.py
│   ├── crud/                    <- DB access functions, one file per model
│   │   ├── user.py
│   │   ├── staff.py
│   │   ├── client.py
│   │   ├── service.py
│   │   ├── schedule.py
│   │   └── appointment.py
│   ├── services/                <- business logic that doesn't fit a single CRUD file
│   │   ├── availability.py      <- computes open time slots for staff+service+date
│   │   └── booking.py           <- appointment creation + double-booking conflict checks
│   ├── api/
│   │   ├── deps.py              <- get_db, get_current_user, get_current_owner
│   │   └── v1/
│   │       ├── auth.py          <- register / login / me
│   │       ├── availability.py
│   │       ├── services.py
│   │       ├── clients.py
│   │       ├── staff.py
│   │       ├── schedule.py      <- staff-schedules, staff-time-off
│   │       └── appointments.py  <- book appointment, update status
│   └── main.py                  <- FastAPI app, router registration, table creation
├── tests/
│   └── test_booking.py          <- pytest suite for booking.py conflict logic
├── pytest.ini                   <- sets pythonpath = . so tests can import app.*
└── .env                         <- SECRET_KEY, DATABASE_URL (not committed)
```

## Setup

```powershell
# from project root
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy psycopg2-binary "pydantic[email]" pydantic-settings passlib python-jose pytest
pip install "bcrypt==4.0.1"   # newer bcrypt breaks passlib's version detection
```

Create `.env` in the project root:
```dotenv
SECRET_KEY=<a real random value — generate with: python -c "import secrets; print(secrets.token_hex(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
```

Run the server:
```powershell
python -m uvicorn app.main:app --reload
```
Swagger UI: `http://127.0.0.1:8000/docs`

Run tests:
```powershell
pytest tests/test_booking.py -v
```

## Auth Model

- Public self-registration (`POST /auth/register`) always creates an **owner**
  account — this is meant for "a new business signs up," not general signup.
- Staff accounts are **invite-only**: there is currently no API endpoint for
  an owner to create a staff login (see Known Gaps below) — done via a
  one-off script calling `create_user(..., is_owner=False)` directly.
- JWT bearer tokens, 60-minute expiry by default.
- `get_current_owner` dependency enforces owner-only actions (creating staff
  profiles, services, staff schedules).

## API Surface (Phases 1–3)

| Area | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| **Services** | `POST /services` (owner), `GET /services`, `GET /services/{id}` |
| **Clients** | `POST /clients`, `GET /clients`, `GET /clients/{id}`, `PATCH /clients/{id}` |
| **Staff** | `POST /staff` (owner), `GET /staff`, `GET /staff/{id}`, `PATCH /staff/{id}` (owner) |
| **Schedule** | `POST /staff-schedules` (owner), `POST /staff-time-off` (owner) |
| **Availability** | `GET /availability?staff_id=&service_id=&target_date=` |
| **Appointments** | `POST /appointments`, `PATCH /appointments/{id}/status` |

## Key Business Rules Implemented

- A staff member cannot be double-booked at an overlapping time.
- A client cannot be double-booked at an overlapping time (across different staff).
- Service duration determines slot size and appointment length.
- An appointment must have at least one service.
- Manually scheduled staff time-off removes that staff member's availability
  for that date entirely.
- Booked appointments are excluded from the availability engine's returned slots.

## Known Gaps / Deferred Work

- **No "owner creates staff login" endpoint.** `StaffCreate` requires a
  `user_id`, but there's no API to create that staff `User` account —
  currently done via a throwaway script (see `create_staff2.py`-style pattern).
- **No appointment listing endpoints** (by date / staff / client) — only
  create and status-update exist so far.
- **Double-booking check has a small race-condition window** — two
  simultaneous requests could theoretically both pass the conflict check
  before either commits. Fine at normal booking traffic; a full fix would
  use a Postgres `EXCLUDE USING gist` constraint.
- **Pydantic v1-style `class Config` deprecation warnings** — should migrate
  to `model_config = ConfigDict(...)` across schema files.
- **`declarative_base()` deprecation warning** — should import from
  `sqlalchemy.orm` instead of the legacy path.
- **Tables are created via `Base.metadata.create_all()`** in `main.py` —
  noted in the code as a placeholder; Alembic migrations are the intended
  long-term approach.

## Roadmap

- [x] **Phase 1** — Foundation (project setup, base models, JWT auth, CRUD basics)
- [x] **Phase 2** — Staff Scheduling (working hours, manual time-off, availability engine)
- [x] **Phase 3** — Appointment Booking (booking, double-booking prevention, status workflow)
- [ ] **Phase 4** — Client Management / CRM (full profile, appointment history, notes/preferences/tags, search & filter)
- [ ] **Phase 5** — Payment Processing (record payments, multiple methods, totals from services, basic sales reports)
- [ ] **Phase 6** — Polish & Safety (error handling, input validation, role-based access, dashboard endpoints)


# UI
download and install the node.js
npx create-next-app@latest saassched-frontend





