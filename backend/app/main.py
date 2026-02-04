from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # <--- YENİ IMPORT
import os

from app.api.routes import auth, recommendation, lessons, questions, history, upload # <--- upload EKLENDİ
from app.core.database import engine, Base

# FastAPI app TANIMI
app = FastAPI(
    title="Adaptive Learning Backend",
    version="1.0.0"
)

# CORS Ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5174", "http://localhost:5174", "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB tablolarını oluştur
Base.metadata.create_all(bind=engine)

# --- STATİK DOSYA SUNUCUSU (YENİ KISIM) ---
# uploads klasörü yoksa oluştur
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# http://localhost:8000/uploads/dosya_adi.pdf adresinden erişim sağlar
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads") 

# Router'ları ekle
app.include_router(auth.router)
app.include_router(recommendation.router)
app.include_router(lessons.router)    
app.include_router(questions.router)
app.include_router(history.router)
app.include_router(upload.router) # <--- Router Eklendi

@app.get("/")
def root():
    return {"status": "ok"}