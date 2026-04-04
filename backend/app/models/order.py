import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base

class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "pending_payment" # Pagka-submit ng form, dito muna.
    ACTIVE_INQUIRY = "active_inquiry"   # Bayad na ang 1k/5k commitment fee.
    QUOTED = "quoted"                   # Nabigyan na ng official price ng Admin.
    IN_PRODUCTION = "in_production"     # Bayad na ang 50% DP.
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Form Details (galing sa frontend)
    company_name = Column(String(255), nullable=True)
    service_type = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    budget_range = Column(String(100), nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=False)
    fabric_preference = Column(String(255), nullable=True)
    size_breakdown = Column(String(255), nullable=True)
    design_details = Column(Text, nullable=False)
    reference_image_url = Column(String(1024), nullable=True)
    
    # State & Financials
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING_PAYMENT, nullable=False)
    total_amount_cents = Column(Integer, nullable=True) # Set by Admin later
    deposit_paid_cents = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="orders")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="order", cascade="all, delete-orphan")