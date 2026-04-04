import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Explicitly import everything to force registration
from app.models.base import Base
from app.models.user import User, OTPCode
from app.models.order import Order
from app.models.payment import Payment
from app.models.chat import Message
from app.models.production import Inquiry, Job, InventoryItem, SystemSettings, NotificationLog

print("Loading environment variables...")
load_dotenv()

# We get the URL and REMOVE the "-pooler" part to force a direct connection for creating tables
raw_url = os.getenv("DATABASE_URL")
if not raw_url:
    print("ERROR: DATABASE_URL not found in .env!")
    exit()

direct_url = raw_url.replace("-pooler", "")

print("Connecting directly to Neon DB (Bypassing Pooler)...")
# echo=True will print the exact SQL queries to your terminal
engine = create_engine(direct_url, echo=True)

print("\n=== Registered Tables ===")
print(list(Base.metadata.tables.keys()))
print("=========================\n")

print("Executing SQL to build tables...")
Base.metadata.create_all(bind=engine)

print("\n✅ SUCCESS! Tables forcefully created.")