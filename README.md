
Run environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# To Test in Pytest
pytest tests/test_booking.py -v

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






