from pydantic import BaseModel
from datetime import date

# ---------------- Products ----------------
class ProductBase(BaseModel):
    name: str
    category: str
    cost_price: float
    sell_price: float

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

# ---------------- Sales ----------------
class SaleBase(BaseModel):
    product_id: int
    quantity: int
    sale_price: float
    sale_date: date

class SaleCreate(SaleBase):
    pass

class SaleUpdate(SaleBase):
    pass

class Sale(SaleBase):
    id: int

    class Config:
        orm_mode = True

# ---------------- Expenses ----------------
class ExpenseBase(BaseModel):
    description: str
    amount: float
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int

    class Config:
        orm_mode = True
