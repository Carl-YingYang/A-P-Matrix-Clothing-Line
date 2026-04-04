import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()

def create_commitment_fee_link(inquiry_id: int, client_name: str, client_email: str):
    PAYMONGO_SECRET_KEY = os.getenv("PAYMONGO_SECRET_KEY")
    # Kinukuha ang FRONTEND_URL sa .env (Fallback sa localhost kung wala)
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174") 
    
    if not PAYMONGO_SECRET_KEY:
        print("ERROR: PAYMONGO_SECRET_KEY is missing!")
        return None

    url = "https://api.paymongo.com/v1/checkout_sessions"
    
    payload = {
        "data": {
            "attributes": {
                "billing": {
                    "name": client_name,
                    "email": client_email
                },
                "send_email_receipt": True,
                "show_description": True,
                "show_line_items": True,
                "description": f"Commitment Fee for REQ-{inquiry_id}",
                "line_items": [
                    {
                        "currency": "PHP",
                        "amount": 100000, 
                        "description": "Commitment Fee",
                        "name": "A&P Production Fee",
                        "quantity": 1
                    }
                ],
                "payment_method_types": ["gcash", "paymaya", "card"],
                # 💡 DYNAMIC NA ANG REDIRECT URLS NATIN NGAYON 💡
                "success_url": f"{FRONTEND_URL}/client/dashboard",
                "cancel_url": f"{FRONTEND_URL}/contact"
            }
        }
    }

    try:
        response = requests.post(url, json=payload, auth=HTTPBasicAuth(PAYMONGO_SECRET_KEY, ''))
        response.raise_for_status()
        data = response.json()
        
        return {
            "checkout_url": data['data']['attributes']['checkout_url'],
            "paymongo_id": data['data']['id'] 
        }
    except Exception as e:
        print(f"PayMongo Request Failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print("PAYMONGO ERROR DETAILS:", e.response.text)
        return None