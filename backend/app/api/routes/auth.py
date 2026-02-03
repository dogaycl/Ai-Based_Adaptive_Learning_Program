from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
auth_service = AuthService()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Register fonksiyonu veritabanına kayıt yapar ve sonucu döner
    return auth_service.register(
        db,
        user.username,
        user.email,
        user.password,
        user.role
    )

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    token_data = auth_service.login(db, user.email, user.password)
    if not token_data:
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")
    # HATA DÜZELTİLDİ: token yerine token_data dönüyoruz
    return token_data

@router.post("/complete-placement/{user_id}")
def complete_placement(user_id: int, score: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_placement_completed = True
    # Basit bir mantık: 10 soruda 0-2 doğru ise Level 1, 3-5 doğru Level 2... gibi
    if score <= 2: user.current_level = 1
    elif score <= 5: user.current_level = 2
    elif score <= 7: user.current_level = 3
    elif score <= 9: user.current_level = 4
    else: user.current_level = 5
    
    db.commit()
    return {"message": "Placement completed", "new_level": user.current_level}

@router.get("/me/{user_id}")
def get_user_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "is_placement_completed": user.is_placement_completed,
        "current_level": user.current_level,
        "role": user.role
    }