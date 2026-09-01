
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
