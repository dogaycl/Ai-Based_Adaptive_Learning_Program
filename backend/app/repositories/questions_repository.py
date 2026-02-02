from sqlalchemy.orm import Session
from app.models.questions import Question

class QuestionRepository:
    def get_questions_by_lesson(self, db: Session, lesson_id: int):
        return db.query(Question).filter(Question.lesson_id == lesson_id).all()

    def get_by_id(self, db: Session, question_id: int):
        return db.query(Question).filter(Question.id == question_id).first()

    def create(self, db: Session, question: Question):
        db.add(question)
        db.commit()
        db.refresh(question)
        return question

    def update(self, db: Session, question_id: int, update_data: dict):
        db.query(Question).filter(Question.id == question_id).update(update_data)
        db.commit()
        return self.get_by_id(db, question_id)

    def delete(self, db: Session, question_id: int):
        question = self.get_by_id(db, question_id)
        if question:
            db.delete(question)
            db.commit()
        return question
