from pydantic import BaseModel
from datetime import date

class LedgerEntry(BaseModel):
    name: str
    description: str
    amount: float
    date: date
    category: str

class LedgerEntryout(LedgerEntry):
    id:int


    class Config:
        orm_mode=True

class ItemBase(BaseModel):
    item_name: str
    price: float
    description: str
    expiry_date: date

class ItemCreate(ItemBase):
    pass

class ItemOut(ItemBase):
    item_id: int

    class Config:
        orm_mode = True



class CartBase(BaseModel):
    item_id: int      
    cart_created: date

class CartCreate(CartBase):
    pass

class CartOut(CartBase):
    cart_id: int
    item_name: str     
    total_price: float

    class Config:
        orm_mode = True