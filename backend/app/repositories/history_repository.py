from sqlalchemy.orm import Session
from app.models.history import History

class HistoryRepository:
    def get_user_history(self, db: Session, user_id: int):
        """Kullanıcının tüm geçmişini getirir"""
        return db.query(History).filter(History.user_id == user_id).all()

    def get_question_stats(self, db: Session, question_id: int):
        """Bir sorunun genel başarı ve süre ortalamasını analiz etmek için kullanılabilir"""
        return db.query(History).filter(History.question_id == question_id).all()

    def create(self, db: Session, history: History):
        db.add(history)
        db.commit()
        db.refresh(history)
        return history