from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_current_owner
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut
from app.crud import service as service_crud

router = APIRouter()


@router.post("/services", response_model=ServiceOut, status_code=201)
def create_service(service_in: ServiceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_owner)):
    return service_crud.create_service(db, service_in)


@router.get("/services/{service_id}", response_model=ServiceOut)
def read_service(service_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = service_crud.get_service(db, service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.get("/services", response_model=list[ServiceOut])
def list_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service_crud.get_services(db, skip, limit)