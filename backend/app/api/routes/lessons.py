from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.lessons import LessonCreate, LessonResponse
from app.services.lessons_service import LessonService

router = APIRouter(prefix="/lessons", tags=["Lessons"])
lesson_service = LessonService()

@router.get("/", response_model=List[LessonResponse])
def get_all_lessons(db: Session = Depends(get_db)):
    return lesson_service.get_all_lessons(db)

@router.post("/", response_model=LessonResponse)
def create_new_lesson(
    lesson: LessonCreate, 
    db: Session = Depends(get_db)
):
    return lesson_service.create_lesson(db, lesson)

@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

# --- DÜZELTİLEN SİLME FONKSİYONU ---
@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    # 1. Önce ders var mı kontrol et
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # 2. Varsa sil (Artık servisi çağırıyoruz)
    lesson_service.delete_lesson(db, lesson_id)
    
    return {"message": "Lesson deleted successfully"}