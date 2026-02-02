from sqlalchemy.orm import Session
from app.models.lessons import Lesson

class LessonRepository:
    def get_all(self, db: Session):
        return db.query(Lesson).all()

    def get_by_id(self, db: Session, lesson_id: int):
        return db.query(Lesson).filter(Lesson.id == lesson_id).first()

    def create(self, db: Session, lesson: Lesson):
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson

    def update(self, db: Session, lesson_id: int, update_data: dict):
        db.query(Lesson).filter(Lesson.id == lesson_id).update(update_data)
        db.commit()
        return self.get_by_id(db, lesson_id)

    def delete(self, db: Session, lesson_id: int):
        lesson = self.get_by_id(db, lesson_id)
        if lesson:
            db.delete(lesson)
            db.commit()
        return lesson
