from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# 1. 💡 IMPORTANTE: I-import yung router natin
from app.api.v1.endpoints.router import router

app = FastAPI(title="A&P Matrix API")

# 2. CORS SETUP (Yung inayos natin kanina)
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5174"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================================================================
# 3. 🚨 ITO YUNG NAWAWALA KAYA NAG-404 LAHAT! 🚨
# Kinakabit nito yung buong router.py mo sa /api/v1 na path
# =================================================================
app.include_router(router, prefix="/api/v1")