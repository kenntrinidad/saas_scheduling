from app.core.database import SessionLocal, engine
from sqlalchemy import text

try:
  with engine.connect() as connection:
    # Test raw connection
    result = connection.execute(text("SELECT current_database();"))
    db_name = result.scalar()
    print(f"Successfully connected to database: {db_name}")

    # Test schema visibility
    schema_result = connection.execute(
        text(
            "SELECT schema_name FROM information_schema.schemata WHERE"
            " schema_name = 'saas_sched';"
        )
    )
    if schema_result.scalar():
      print("Schema 'saas_sched' exists and is accessible.")
    else:
      print("Warning: Schema 'saas_sched' was not found.")

  # Test session maker
  db = SessionLocal()
  db.close()
  print("SessionLocal initialized successfully.")

except Exception as e:
  print(f"Connection failed: {e}")