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

    # HATA BURADAYDI: Bu fonksiyonun içeriği sağa kaydırıldı.
    def get_user_summary(self, db: Session, user_id: int):
        stats = self.get_user_stats(db, user_id)
        return stats

    def get_user_summary(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        stats = self.get_user_stats(db, user_id)
        
        # Ders bazlı performans analizi (Gelişmiş veri yolu)
        lesson_performance = defaultdict(lambda: {"correct": 0, "total": 0})
        for h in histories:
            # Soru üzerinden ders bilgisini al (İlişkili tablo sorgusu gerekebilir, şimdilik soru ID bazlı)
            lesson_id = h.question_id # Basitleştirilmiş mantık
            lesson_performance[lesson_id]["total"] += 1
            if h.is_correct:
                lesson_performance[lesson_id]["correct"] += 1

        return {
            "general_stats": stats,
            "lesson_breakdown": {
                f"lesson_{lid}": (data["correct"] / data["total"] * 100) 
                for lid, data in lesson_performance.items()
            }
        }
