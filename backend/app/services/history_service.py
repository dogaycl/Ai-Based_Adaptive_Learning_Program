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
        is_correct = question.correct_answer.strip().upper() == history_data.given_answer.strip().upper()

        # 3. History kaydını oluştur
        db_history = History(
            user_id=user_id,
            question_id=history_data.question_id,
            given_answer=history_data.given_answer,
            is_correct=is_correct,
            time_spent_seconds=history_data.time_spent_seconds
        )
        return self.history_repo.create(db, db_history)

    def get_user_stats(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        
        total_questions = len(histories)
        correct_answers = sum(1 for h in histories if h.is_correct)
        total_time = sum(h.time_spent_seconds for h in histories)

        return {
            "accuracy": (correct_answers / total_questions * 100) if total_questions > 0 else 0,
            "total_questions": total_questions,
            "total_correct": correct_answers,
            "total_time_seconds": total_time
        }

    def get_user_summary(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        
        lesson_data = defaultdict(lambda: {"correct": 0, "total": 0, "total_time": 0})
        
        for h in histories:
            if h.question and h.question.lesson:
                lesson_title = h.question.lesson.title
                
                lesson_data[lesson_title]["total"] += 1
                lesson_data[lesson_title]["total_time"] += h.time_spent_seconds
                
                if h.is_correct:
                    lesson_data[lesson_title]["correct"] += 1

        lesson_breakdown = {
            title: (d["correct"] / d["total"] * 100) if d["total"] > 0 else 0 
            for title, d in lesson_data.items()
        }
        
        total_correct = sum(1 for h in histories if h.is_correct)
        total_q = len(histories)
        
        return {
            "lesson_breakdown": lesson_breakdown,
            "total_stats": {
                "total_questions": total_q,
                "total_correct": total_correct,
                "avg_time": (sum(h.time_spent_seconds for h in histories) / total_q) if total_q > 0 else 0
            }
        }

    def get_user_trend(self, db: Session, user_id: int):
        # Circular import'u önlemek için model burada çağrılır
        from app.models.history import History
        
        histories = (
            db.query(History)
            .filter(History.user_id == user_id)
            .order_by(History.solved_at.asc())
            .limit(20)
            .all()
        )
        
        trend_data = []
        for h in histories:
            if h.question and h.question.lesson:
                trend_data.append({
                    "date": h.solved_at.strftime("%d/%m %H:%M"),
                    "lesson": h.question.lesson.title,
                    "score": 100 if h.is_correct else 0,
                    "difficulty": h.question.difficulty_level
                })
            
        return trend_data

    # --- İŞTE EKSİK OLAN KISIM BURASI ---
    def get_class_analytics(self, db: Session):
        """Öğretmen Dashboard'u için sınıf analizi"""
        from app.models.user import User
        from app.models.lessons import Lesson
        from app.models.history import History
        from app.models.questions import Question

        # 1. ÖĞRENCİ LİSTESİ VE BAŞARI ORANLARI
        students = db.query(User).filter(User.role == "student").all()
        student_performance = []

        for s in students:
            # Her öğrenci için istatistik hesapla
            stats = self.get_user_stats(db, s.id)
            student_performance.append({
                "id": s.id,
                "username": s.username,
                "email": s.email,
                "accuracy": int(stats["accuracy"]),
                "total_xp": stats["total_correct"] * 10,
                "total_solved": stats["total_questions"]
            })

        # 2. DERS BAZLI BAŞARI ORANLARI
        lessons = db.query(Lesson).all()
        lesson_performance = []

        for l in lessons:
            questions = db.query(Question).filter(Question.lesson_id == l.id).all()
            q_ids = [q.id for q in questions]

            if not q_ids:
                pass_rate = 0
            else:
                attempts = db.query(History).filter(History.question_id.in_(q_ids)).all()
                if not attempts:
                    pass_rate = 0
                else:
                    correct_count = sum(1 for a in attempts if a.is_correct)
                    pass_rate = int((correct_count / len(attempts)) * 100)
            
            lesson_performance.append({
                "name": l.title,
                "passRate": pass_rate,
                "total_questions": len(q_ids)
            })

        return {
            "students": student_performance,
            "lessons": lesson_performance,
            "total_students": len(students)
        }