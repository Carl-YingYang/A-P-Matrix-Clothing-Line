import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Force load the .env file
load_dotenv()

SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")

def send_otp_email(to_email: str, otp_code: str):
    """Sends a 6-digit OTP to the client's email via Gmail SMTP."""
    
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("CRITICAL ERROR: SMTP credentials missing from .env")
        return False

    # 1. Formatting the email
    msg = EmailMessage()
    msg["Subject"] = "Your A&P Matrix Login Code"
    msg["From"] = f"A&P Matrix <{SMTP_EMAIL}>"
    msg["To"] = to_email
    
    # Clean, professional email body
    msg.set_content(f"""
    Hello,

    Your login code for A&P Matrix Clothing Line is: {otp_code}
    
    This code will expire in 10 minutes. Please do not share this with anyone.
    
    Regards,
    A&P Matrix Engineering Team
    """)

    # 2. Sending the email securely via SSL
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False