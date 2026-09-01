
Run environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

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






