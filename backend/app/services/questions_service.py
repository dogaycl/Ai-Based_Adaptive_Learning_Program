from sqlalchemy.orm import Session
from app.models.questions import Question
from app.repositories.questions_repository import QuestionRepository
from app.schemas.questions import QuestionCreate

class QuestionService:
    def __init__(self):
        self.question_repo = QuestionRepository()

    def add_question_to_lesson(self, db: Session, question_data: QuestionCreate):
        db_question = Question(
            lesson_id=question_data.lesson_id,
            content=question_data.content,
            correct_answer=question_data.correct_answer,
            difficulty_level=question_data.difficulty_level
        )
        return self.question_repo.create(db, db_question)

    def get_lesson_questions(self, db: Session, lesson_id: int):
        return self.question_repo.get_questions_by_lesson(db, lesson_id)