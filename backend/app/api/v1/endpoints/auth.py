import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Import your DB session and Models
from app.db.session import SessionLocal # Adjust this import if your db session is named differently
from app.models.user import User, OTPCode
from app.core.email import send_otp_email
from app.core.security import create_access_token
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Dependency to get DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Request Schemas
class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    code: str

@router.post("/request-otp")
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    
    # 1. Find or Create the User
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # 2. Generate a random 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # 3. Save OTP to database
    otp_entry = OTPCode(user_id=user.id, code=code, expires_at=expires_at)
    db.add(otp_entry)
    db.commit()
    
    # 4. Send the Email
    email_sent = send_otp_email(email, code)
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send email. Check SMTP settings.")
        
    return {"message": "OTP sent successfully to your email."}

@router.post("/verify-otp")
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    email = payload.email.lower()
    
    # 1. Find the User
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Find the latest OTP for this user
    otp_entry = db.query(OTPCode).filter(
        OTPCode.user_id == user.id,
        OTPCode.code == payload.code
    ).order_by(OTPCode.id.desc()).first()
    
    # 3. Validate OTP
    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    if datetime.now(timezone.utc) > otp_entry.expires_at:
        raise HTTPException(status_code=400, detail="OTP code has expired")
        
    # 4. Generate JWT Token (Success!)
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    
    # 5. Clean up (Delete the used OTP so it can't be reused)
    db.delete(otp_entry)
    db.commit()
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": str(user.id), "email": user.email, "role": user.role.value}
    }