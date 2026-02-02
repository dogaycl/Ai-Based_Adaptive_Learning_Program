from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.schemas.user import TokenResponse
from app.schemas.user import TokenResponse


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
    return token
