from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.client import ClientCreate, ClientUpdate, ClientOut
from app.schemas.appointment import AppointmentOut
from app.crud import client as client_crud

router = APIRouter()


@router.post("/clients", response_model=ClientOut, status_code=201)
def create_client(client_in: ClientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return client_crud.create_client(db, client_in)


@router.get("/clients/{client_id}", response_model=ClientOut)
def read_client(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = client_crud.get_client(db, client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/clients", response_model=list[ClientOut])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    tag: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return client_crud.get_clients(db, skip, limit, search, tag)


@router.patch("/clients/{client_id}", response_model=ClientOut)
def update_client(client_id: int, client_in: ClientUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = client_crud.update_client(db, client_id, client_in)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/clients/{client_id}/appointments", response_model=list[AppointmentOut])
def read_client_appointments(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = client_crud.get_client(db, client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client_crud.get_client_appointments(db, client_id)