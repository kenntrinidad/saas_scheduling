# drop_payments_table.py — run once from your project root, then delete it
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS payments CASCADE;"))
    conn.commit()

print("Dropped payments table.")