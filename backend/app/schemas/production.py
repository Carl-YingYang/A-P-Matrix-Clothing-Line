from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ==========================================
# -------- INQUIRY SCHEMAS --------
# ==========================================
class InquiryCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    company: Optional[str] = None
    service: str
    quantity: int
    budget: str
    details: str
    reference_image: Optional[str] = None

class InquiryResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    company: Optional[str] = None
    service: str
    quantity: int
    budget: str
    details: str
    reference_image: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    
    quoted_amount: Optional[float] = None
    quote_description: Optional[str] = None
    invoice_id: Optional[str] = None
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    is_refunded: Optional[bool] = False

    class Config:
        from_attributes = True

class InquiryUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None


# ==========================================
# -------- JOB SCHEMAS --------
# ==========================================
class JobCreate(BaseModel):
    client_name: str
    order_type: str
    quantity: int
    deadline: str
    reference_image: Optional[str] = None
    details: Optional[str] = None
    amount: Optional[float] = None

class JobResponse(BaseModel):
    id: int
    client_name: str
    order_type: str
    quantity: int
    stage: str
    deadline: str
    reference_image: Optional[str] = None
    details: Optional[str] = None
    estimated_time: Optional[str] = None
    amount: Optional[float] = None

    class Config:
        from_attributes = True

class JobUpdate(BaseModel):
    stage: Optional[str] = None
    estimated_time: Optional[str] = None


# ==========================================
# -------- INVENTORY SCHEMAS --------
# ==========================================
class InventoryCreate(BaseModel):
    sku: str
    name: str
    category: str
    stock: int
    unit: str
    status: str

class InventoryResponse(InventoryCreate):
    id: int
    class Config:
        from_attributes = True

class InventoryUpdate(BaseModel):
    stock: int
    status: str


# ==========================================
# -------- SETTINGS SCHEMAS --------
# ==========================================
class SettingsUpdate(BaseModel):
    full_name: str
    email: str

class SettingsResponse(BaseModel):
    id: int
    full_name: str
    email: str
    branch: str

    class Config:
        from_attributes = True


# ==========================================
# -------- NOTIFICATION SCHEMAS --------
# ==========================================
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: str
    created_at: datetime

    class Config:
        from_attributes = True