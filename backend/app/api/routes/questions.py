from sqlalchemy import func
from app.models.questions import Question
from sqlalchemy.sql.expression import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.questions import QuestionCreate, QuestionResponse
from app.services.questions_service import QuestionService
from typing import List
from app.core.security import check_admin_role

router = APIRouter(prefix="/questions", tags=["Questions"])
question_service = QuestionService()

@router.get("/lesson/{lesson_id}", response_model=List[QuestionResponse])
def get_questions_by_lesson(lesson_id: int, db: Session = Depends(get_db)):
    return question_service.get_lesson_questions(db, lesson_id)

@router.post("/", response_model=QuestionResponse)
def add_question(question: QuestionCreate, role: str, db: Session = Depends(get_db)):
    # Soru ekleme yetki kontrolüyle beraber tek fonksiyona indirildi
    check_admin_role(role)
    return question_service.add_question_to_lesson(db, question)

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, question: QuestionCreate, role: str, db: Session = Depends(get_db)):
    check_admin_role(role)
    return question_service.update_question(db, question_id, question)

@router.delete("/{question_id}")
def delete_question(question_id: int, role: str, db: Session = Depends(get_db)):
    check_admin_role(role)
    success = question_service.remove_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    return {"message": "Soru başarıyla silindi"}

@router.get("/placement-test")
def get_placement_questions(db: Session = Depends(get_db)):
    all_questions = []
    # Her zorluk seviyesinden (1-5) rastgele 2'şer soru seçer
    for level in range(1, 6):
        questions = db.query(Question).filter(Question.difficulty_level == level).order_by(func.rand()).limit(2).all()
        all_questions.extend(questions)
    return all_questions