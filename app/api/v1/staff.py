from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_current_owner
from app.schemas.staff import StaffCreate, StaffUpdate, StaffOut
from app.crud import staff as staff_crud

router = APIRouter()


@router.post("/staff", response_model=StaffOut, status_code=201)
def create_staff(staff_in: StaffCreate, db: Session = Depends(get_db), current_user=Depends(get_current_owner)):
    return staff_crud.create_staff(db, staff_in)


@router.get("/staff/{staff_id}", response_model=StaffOut)
def read_staff(staff_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    staff = staff_crud.get_staff(db, staff_id)
    if staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff


@router.get("/staff", response_model=list[StaffOut])
def list_staff(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return staff_crud.get_all_staff(db, skip, limit)


@router.patch("/staff/{staff_id}", response_model=StaffOut)
def update_staff(staff_id: int, staff_in: StaffUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_owner)):
    return staff_crud.update_staff(db, staff_id, staff_in)