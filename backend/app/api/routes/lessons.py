from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.lessons import LessonCreate, LessonResponse
from app.services.lessons_service import LessonService
from typing import List
from app.core.security import check_admin_role

router = APIRouter(prefix="/lessons", tags=["Lessons"])
lesson_service = LessonService()

# Sadece TÜM dersleri getiren GET kalsın
@router.get("/", response_model=List[LessonResponse])
def get_all_lessons(db: Session = Depends(get_db)):
    return lesson_service.get_all_lessons(db)

# Sadece ROL KONTROLLÜ olan POST kalsın (diğerini sil!)
@router.post("/", response_model=LessonResponse)
def create_new_lesson(lesson: LessonCreate, role: str, db: Session = Depends(get_db)):
    check_admin_role(role)
    return lesson_service.create_lesson(db, lesson)

@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, lesson: LessonCreate, role: str, db: Session = Depends(get_db)):
    check_admin_role(role)
    return lesson_service.update_lesson(db, lesson_id, lesson)