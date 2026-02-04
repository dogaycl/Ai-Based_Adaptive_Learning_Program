from sqlalchemy.orm import Session
from app.models.history import History
from app.models.user import User
from app.models.lessons import Lesson
from app.models.questions import Question
from app.repositories.history_repository import HistoryRepository
from app.repositories.questions_repository import QuestionRepository
from app.schemas.history import HistoryCreate

class HistoryService:
    def __init__(self):
        self.history_repo = HistoryRepository()
        self.question_repo = QuestionRepository()

    # --- 1. ÖĞRENCİ CEVAP KAYDI VE LEVEL MANTIĞI ---
    def submit_answer(self, db: Session, user_id: int, history_data: HistoryCreate):
        # Soruyu bul
        question = self.question_repo.get_by_id(db, history_data.question_id)
        if not question:
            raise Exception("Question not found!")

        # Doğruluk kontrolü
        is_correct = question.correct_answer.strip().upper() == history_data.given_answer.strip().upper()

        # Kayıt oluştur
        db_history = History(
            user_id=user_id,
            question_id=history_data.question_id,
            given_answer=history_data.given_answer,
            is_correct=is_correct,
            time_spent_seconds=history_data.time_spent_seconds
        )
        self.history_repo.create(db, db_history)

        # LEVEL HESAPLAMA (DÜŞME ÖZELLİKLİ)
        total_correct = db.query(History).filter(History.user_id == user_id, History.is_correct == True).count()
        total_wrong = db.query(History).filter(History.user_id == user_id, History.is_correct == False).count()

        # Net Skor: Her 5 net doğru = 1 Level
        net_score = total_correct - total_wrong
        new_level = max(1, 1 + (net_score // 5))

        user = db.query(User).filter(User.id == user_id).first()
        if user and user.current_level != new_level:
            user.current_level = new_level
            db.add(user)
            db.commit()
            db.refresh(user)

        return db_history

    # --- 2. TEKİL ÖĞRENCİ İSTATİSTİKLERİ ---
    def get_user_stats(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        
        total_questions = len(histories)
        if total_questions == 0:
            return {"accuracy": 0, "total_correct": 0, "total_questions": 0}

        correct_count = sum(1 for h in histories if h.is_correct)
        accuracy = (correct_count / total_questions) * 100
        
        return {
            "accuracy": round(accuracy, 1),
            "total_correct": correct_count,
            "total_questions": total_questions
        }

    # --- 3. ÖĞRENCİ DETAYLI ÖZET (AI İÇİN) ---
    def get_user_summary(self, db: Session, user_id: int):
        histories = self.history_repo.get_user_history(db, user_id)
        lesson_breakdown = {}
        
        for h in histories:
            q = db.query(Question).filter(Question.id == h.question_id).first()
            if q and q.lesson:
                lesson_title = q.lesson.title
                if lesson_title not in lesson_breakdown:
                    lesson_breakdown[lesson_title] = {"correct": 0, "total": 0}
                
                lesson_breakdown[lesson_title]["total"] += 1
                if h.is_correct:
                    lesson_breakdown[lesson_title]["correct"] += 1
        
        final_breakdown = {}
        for title, data in lesson_breakdown.items():
            final_breakdown[title] = (data["correct"] / data["total"]) * 100 if data["total"] > 0 else 0

        total_time = sum(h.time_spent_seconds for h in histories)
        avg_time = total_time / len(histories) if histories else 0

        return {
            "lesson_breakdown": final_breakdown,
            "total_stats": {"avg_time": avg_time, "total_solved": len(histories)}
        }

    # --- 4. ÖĞRETMEN ANALİTİKLERİ (EKSİK OLAN KISIM BURASIYDI) ---
    def get_class_analytics(self, db: Session):
        # A. Öğrenci Listesi ve Performansları
        students = db.query(User).filter(User.role == "student").all()
        student_performance = []

        for s in students:
            stats = self.get_user_stats(db, s.id)
            student_performance.append({
                "id": s.id,
                "username": s.username,
                "email": s.email,
                "accuracy": int(stats["accuracy"]),
                "total_xp": stats["total_correct"] * 10,
                "total_solved": stats["total_questions"]
            })

        # B. Ders Bazlı Başarı Oranları
        lessons = db.query(Lesson).all()
        lesson_performance = []

        for l in lessons:
            # Bu derse ait tüm soruları bul
            questions = db.query(Question).filter(Question.lesson_id == l.id).all()
            q_ids = [q.id for q in questions]

            if not q_ids:
                pass_rate = 0
            else:
                # Bu sorulara verilmiş tüm cevapları bul
                attempts = db.query(History).filter(History.question_id.in_(q_ids)).all()
                if not attempts:
                    pass_rate = 0
                else:
                    correct_count = sum(1 for a in attempts if a.is_correct)
                    pass_rate = int((correct_count / len(attempts)) * 100)
            
            lesson_performance.append({
                "id": l.id,
                "name": l.title,
                "passRate": pass_rate,
                "total_questions": len(q_ids)
            })

        return {
            "students": student_performance,
            "lessons": lesson_performance,
            "total_students": len(students)
        }