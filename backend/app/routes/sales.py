from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas, database

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    return crud.create_sale(db, sale)

@router.get("/{sale_id}", response_model=schemas.Sale)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(sale_id: int, sale: schemas.SaleUpdate, db: Session = Depends(get_db)):
    updated = crud.update_sale(db, sale_id, sale)
    if not updated:
        raise HTTPException(status_code=404, detail="Sale not found")
    return updated

@router.delete("/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_sale(db, sale_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sale not found")
    return {"message": "Sale deleted successfully"}
