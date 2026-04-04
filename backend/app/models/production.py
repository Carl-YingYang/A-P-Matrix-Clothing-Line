from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.sql import func

from datetime import datetime
from app.db.session import Base

class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String)       # BAGONG FIELD
    phone = Column(String)       # BAGONG FIELD
    company = Column(String, nullable=True)
    service = Column(String)
    quantity = Column(Integer)
    budget = Column(String)      # BAGONG FIELD
    details = Column(String)
    reference_image = Column(String, nullable=True) # BAGONG FIELD (Base64)
    status = Column(String, default="New") 
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    quoted_amount = Column(Float, nullable=True)
    quote_description = Column(String, nullable=True)
    invoice_id = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    is_refunded = Column(Boolean, default=False)

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String)
    order_type = Column(String)
    quantity = Column(Integer)
    stage = Column(String, default="Cutting")
    deadline = Column(String)
    reference_image = Column(String, nullable=True) 
    
    # MGA BAGONG FIELDS PARA SA MANANAHI:
    details = Column(String, nullable=True) 
    estimated_time = Column(String, nullable=True, default="Standard (3-4 Weeks)")
    amount = Column(Float, nullable=True) # IDINAGDAG ITO

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    category = Column(String)
    stock = Column(Integer)
    unit = Column(String)
    status = Column(String) # 'Good', 'Low', 'Critical'

class SystemSettings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="Carl Micky Nieva")
    email = Column(String, default="admin@apmatrix.ph")
    branch = Column(String, default="Guiguinto, Bulacan")

class NotificationLog(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    message = Column(String)
    type = Column(String) # 'inquiry', 'payment', 'job', 'inventory', 'system'
    link = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, index=True) # ID ng inquiry/order
    sender_email = Column(String, index=True) # Email nung nag-send (Client or Admin)
    sender_name = Column(String) # Pangalan (Admin or Client Name)
    message_text = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())