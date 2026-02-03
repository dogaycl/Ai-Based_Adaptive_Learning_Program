from sqlalchemy.orm import Session
from app.models.lessons import Lesson
from app.repositories.lessons_repository import LessonRepository
from app.schemas.lessons import LessonCreate

class LessonService:
    def __init__(self):
        self.lesson_repo = LessonRepository()

    def create_lesson(self, db: Session, lesson_data: LessonCreate):
        db_lesson = Lesson(
            title=lesson_data.title,
            description=lesson_data.description,
            content_text=lesson_data.content_text, # Yeni alan
            attachment_url=lesson_data.attachment_url, # Yeni alan
            difficulty=lesson_data.difficulty
        )
        return self.lesson_repo.create(db, db_lesson)

    def get_all_lessons(self, db: Session):
        return self.lesson_repo.get_all(db)

    def update_lesson(self, db: Session, lesson_id: int, lesson_data: LessonCreate):
        update_map = lesson_data.dict() # Tüm alanları otomatik eşle
        return self.lesson_repo.update(db, lesson_id, update_map)