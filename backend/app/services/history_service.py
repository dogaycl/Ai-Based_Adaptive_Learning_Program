from sqlalchemy.orm import Session
from app.models.history import History
from app.repositories.history_repository import HistoryRepository
from app.repositories.questions_repository import QuestionRepository
from app.schemas.history import HistoryCreate
from collections import defaultdict

class HistoryService:
    def __init__(self):
        self.history_repo = HistoryRepository()
        self.question_repo = QuestionRepository()

    def submit_answer(self, db: Session, user_id: int, history_data: HistoryCreate):
        # 1. Sorunun doğru cevabını DB'den bul
        question = self.question_repo.get_by_id(db, history_data.question_id)
        if not question:
            raise Exception("Soru bulunamadı!")

        # 2. Doğruluk kontrolü (İş Mantığı)
        is_correct = question.correct_answer.strip().lower() == history_data.given_answer.strip().lower()

        # 3. History kaydını oluştur
        db_history = History(
            user_id=user_id,
            question_id=history_data.question_id,
            given_answer=history_data.given_answer,
            is_correct=is_correct,
            time_spent_seconds=history_data.time_spent_seconds # Süreyi kaydediyoruz
        )
        return self.history_repo.create(db, db_history)

    def get_user_stats(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        total_questions = len(histories)
        correct_answers = sum(1 for h in histories if h.is_correct)
        # Toplam harcanan süre (saniye)
        total_time = sum(h.time_spent_seconds for h in histories)
        
        return {
            "total_solved": total_questions,
            "accuracy": (correct_answers / total_questions * 100) if total_questions > 0 else 0,
            "total_time_seconds": total_time
        }

    # app/services/history_service.py

    def get_user_summary(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        
        # Lesson performance tracking
        lesson_data = defaultdict(lambda: {"correct": 0, "total": 0, "total_time": 0})
        # Difficulty performance tracking
        difficulty_data = defaultdict(lambda: {"correct": 0, "total": 0})

        for h in histories:
            # We get the lesson title through the question relationship
            lesson_title = h.question.lesson.title
            diff_level = h.question.difficulty_level # 1 to 5
            
            lesson_data[lesson_title]["total"] += 1
            lesson_data[lesson_title]["total_time"] += h.time_spent_seconds
            if h.is_correct:
                lesson_data[lesson_title]["correct"] += 1
                difficulty_data[diff_level]["correct"] += 1
            
            difficulty_data[diff_level]["total"] += 1

        # Calculate percentages
        lesson_breakdown = {
            title: (d["correct"] / d["total"] * 100) if d["total"] > 0 else 0 
            for title, d in lesson_data.items()
        }

        return {
            "lesson_breakdown": lesson_breakdown,
            "difficulty_stats": difficulty_data,
            "total_count": len(histories)
        }
