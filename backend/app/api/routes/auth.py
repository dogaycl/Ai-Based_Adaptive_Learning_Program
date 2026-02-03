from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.models.user import User
from app.services.auth_service import AuthService  # Service import edildi
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    auth_service = AuthService()
    # Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    auth_service.register(db, user.username, user.email, user.password, user.role)
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService()
    result = auth_service.login(db, user.email, user.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result

@router.get("/me/{user_id}")
def get_user_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "current_level": user.current_level,
        "is_placement_completed": user.is_placement_completed
    }

@router.post("/complete-placement/{user_id}")
def complete_placement(user_id: int, score: int, db: Session = Depends(get_db)):
    auth_service = AuthService()
    
    # AI Logic: Determine level based on diagnostic score
    # Score 0-2 -> Level 1 (Easy), 3-4 -> Level 2 (Medium), 5+ -> Level 3 (Hard)
    calculated_level = 1
    if score >= 5:
        calculated_level = 3
    elif score >= 3:
        calculated_level = 2
    
    user = auth_service.update_placement_status(db, user_id, calculated_level)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
        
    return {
        "message": "Diagnostic assessment completed successfully",
        "assigned_level": calculated_level,
        "status": "success"
    }