from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.schemas import LedgerEntry,LedgerEntryout
from app.models import Transactions
from app.database import get_db, Base, engine
from app import models
from typing import List
from app.models import Item, Cart   
from app.schemas import ItemCreate, ItemOut, CartCreate, CartOut 


app=FastAPI()

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return{"message":"Finance ledger API is running"}

@app.post("/add",response_model=dict)
def add_entry(entry: LedgerEntry, db: Session = Depends(get_db)) -> dict:
    new_txn = Transactions(
        name=entry.name,
        description=entry.description,
        amount=entry.amount,
        date=entry.date,
        category=entry.category,
    )
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)

    return {"message": "Entry added successfully", "id": new_txn.id}

@app.get("/entries",response_model=List[LedgerEntryout])
def get_all_entries(db: Session = Depends(get_db)):
    return db.query(Transactions).all()

@app.put("/entries/{entry_id}",response_model=LedgerEntryout)
def update_entry(entry_id: int, updated_entry: LedgerEntry, db: Session = Depends(get_db)):
    txn = db.query(Transactions).filter(Transactions.id == entry_id).first()

    if not txn:
        return {"error": "Entry not found"}
    txn.name = updated_entry.name
    txn.description = updated_entry.description
    txn.amount = updated_entry.amount
    txn.date = updated_entry.date
    txn.category = updated_entry.category

    db.commit()
    db.refresh(txn)

    return txn


@app.delete("/entries/{entry_id}", response_model=dict)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    txn = db.query(Transactions).filter(Transactions.id == entry_id).first()
    if not txn:
        return {"error": "Entry not found"}
    db.delete(txn)
    db.commit()
    return {"message": "Entry deleted successfully"}





@app.post("/items/", response_model=ItemOut)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(
        item_name=item.item_name,
        price=item.price,
        description=item.description,
        expiry_date=item.expiry_date
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item




@app.get("/items/", response_model=list[ItemOut])
def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()




@app.post("/cart/", response_model=CartOut)
def create_cart(cart: CartCreate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.item_id == cart.item_id).first()
    if not item:
        return {"error": "Item not found"}

    total_price = item.price  

    db_cart = Cart(
        item_id=cart.item_id,
        cart_created=cart.cart_created,
        total_price=total_price
    )

    db.add(db_cart)
    db.commit()
    db.refresh(db_cart)
    return db_cart




@app.get("/cart/{cart_id}", response_model=CartOut)
def get_cart(cart_id: int, db: Session = Depends(get_db)):
    return db.query(Cart).filter(Cart.cart_id == cart_id).first()





@app.get("/cart/", response_model=list[CartOut])
def get_all_carts(db: Session = Depends(get_db)):
    return db.query(Cart).all()