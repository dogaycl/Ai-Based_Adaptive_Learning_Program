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
from app.services.ai_service import AIService # AI Service importu
from app.models.lessons import Lesson

router = APIRouter(prefix="/questions", tags=["Questions"])
question_service = QuestionService()

@router.get("/lesson/{lesson_id}", response_model=List[QuestionResponse])
def get_questions_by_lesson(lesson_id: int, db: Session = Depends(get_db)):
    return question_service.get_lesson_questions(db, lesson_id)

@router.post("/", response_model=QuestionResponse)
def add_question(
    question: QuestionCreate, 
    db: Session = Depends(get_db),
    admin_check = Depends(check_admin_role) # Rolü token'dan kontrol et
):
    return question_service.add_question_to_lesson(db, question)

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int, 
    question: QuestionCreate, 
    db: Session = Depends(get_db),
    admin_check = Depends(check_admin_role) # DÜZELTİLDİ: role parametresi kalktı
):
    return question_service.update_question(db, question_id, question)

@router.delete("/{question_id}")
def delete_question(
    question_id: int, 
    db: Session = Depends(get_db),
    admin_check = Depends(check_admin_role) # DÜZELTİLDİ: role parametresi kalktı
):
    success = question_service.remove_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    return {"message": "Soru başarıyla silindi"}

# --- AI ENDPOINT ---
@router.post("/generate/{lesson_id}")
def generate_ai_questions(lesson_id: int, db: Session = Depends(get_db)):
    # 1. Dersi bul
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # 2. AI Servisini Çağır
    ai_service = AIService()
    generated_data = ai_service.generate_questions(topic=lesson.title, difficulty=lesson.difficulty.value)

    # 3. Kaydet
    new_questions = []
    for q_data in generated_data:
        new_q = Question(
            lesson_id=lesson.id,
            content=q_data["content"],
            option_a=q_data["option_a"],
            option_b=q_data["option_b"],
            option_c=q_data["option_c"],
            option_d=q_data["option_d"],
            correct_answer=q_data["correct_answer"],
            difficulty_level=q_data.get("difficulty_level", 3)
        )
        db.add(new_q)
        new_questions.append(new_q)
    
    db.commit()
    return {"message": f"{len(new_questions)} AI questions generated successfully!", "count": len(new_questions)}

@router.get("/placement-test")
def get_placement_questions(db: Session = Depends(get_db)):
    all_questions = []
    for level in range(1, 6):
        questions = db.query(Question).filter(Question.difficulty_level == level).order_by(func.rand()).limit(2).all()
        all_questions.extend(questions)
    return all_questions