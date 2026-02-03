from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.lessons import LessonCreate, LessonResponse
from app.services.lessons_service import LessonService
from typing import List
from app.core.security import check_admin_role

# Sonda bölü işareti olmaksızın tanımlayalım
router = APIRouter(prefix="/lessons", tags=["Lessons"])
lesson_service = LessonService()

# ÖNEMLİ: GET metodu "/" olarak tanımlandı (Yani /lessons/)
@router.get("", response_model=List[LessonResponse])
@router.get("/", response_model=List[LessonResponse])
def get_all_lessons(db: Session = Depends(get_db)):
    return lesson_service.get_all_lessons(db)

@router.post("", response_model=LessonResponse)
@router.post("/", response_model=LessonResponse)
def create_new_lesson(
    lesson: LessonCreate, 
    db: Session = Depends(get_db),
    admin_check = Depends(check_admin_role)
):
    return lesson_service.create_lesson(db, lesson)