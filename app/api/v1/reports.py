from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from decimal import Decimal
from app.api.deps import get_db, get_current_owner
from app.crud import payment as payment_crud
from pydantic import BaseModel

router = APIRouter()


class SalesReportOut(BaseModel):
    start_date: date
    end_date: date
    total_revenue: Decimal
    payment_count: int
    by_method: dict[str, Decimal]


@router.get("/reports/sales", response_model=SalesReportOut)
def sales_report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_owner),
):
    payments = payment_crud.get_sales_between(db, start_date, end_date)

    by_method: dict[str, Decimal] = {}
    total = Decimal("0")
    for p in payments:
        total += p.amount
        by_method[p.method.value] = by_method.get(p.method.value, Decimal("0")) + p.amount

    return SalesReportOut(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total,
        payment_count=len(payments),
        by_method=by_method,
    )