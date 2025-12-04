from sqlalchemy import Column, Integer, String, Float, Date,ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Transactions(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    category = Column(String, nullable=True)



class Item(Base):
    __tablename__ = "items"

    item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    expiry_date = Column(Date, nullable=False)

   
    carts = relationship("Cart", back_populates="item")



class Cart(Base):
    __tablename__ = "cart"

    cart_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.item_id"))
    cart_created = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False)

  
    item = relationship("Item", back_populates="carts")