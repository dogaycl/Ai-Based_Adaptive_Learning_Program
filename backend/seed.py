import sys
import os

# Mevcut dosyanın bulunduğu klasörü Python yoluna ekle
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from app.core.database import SessionLocal, engine, Base
    # KRİTİK DÜZELTME: Tüm modelleri import ediyoruz ki SQLAlchemy ilişkileri çözebilsin
    from app.models.user import User
    from app.models.lessons import Lesson
    from app.models.questions import Question
    from app.models.history import History
    print("Modüller başarıyla yüklendi.")
except ImportError as e:
    print(f"Hata: Modül bulunamadı! Mevcut konum: {os.getcwd()}")
    print(f"Hata detayı: {e}")
    sys.exit(1)

db = SessionLocal()

def seed_data():
    # 1. Önce tabloları temizleyelim (Opsiyonel ama temiz başlangıç için önerilir)
    # Base.metadata.drop_all(bind=engine)
    # Base.metadata.create_all(bind=engine)

    # 2. Örnek Ders
    lesson = Lesson(
        title="General Placement Test",
        description="Initial assessment for adaptive learning",
        content_text="Welcome to the placement test. AI will analyze your speed and accuracy.",
        difficulty="medium"
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    # 3. Örnek Sorular (Frontend'in beklediği A-B-C-D şıklarıyla)
    questions = [
        Question(
            lesson_id=lesson.id,
            content="What is the primary goal of AI in education?",
            option_a="To replace teachers completely",
            option_b="To provide personalized learning paths",
            option_c="To make exams harder",
            option_d="To reduce school hours",
            correct_answer="B",
            difficulty_level=1
        ),
        Question(
            lesson_id=lesson.id,
            content="Which of the following adaptively changes in this system?",
            option_a="The school building",
            option_b="The student's name",
            option_c="The curriculum difficulty",
            option_d="The teacher's salary",
            correct_answer="C",
            difficulty_level=2
        )
    ]
    
    for q in questions:
        db.add(q)
    
    db.commit()
    print("Başlangıç verileri başarıyla eklendi!")

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"Seed hatası: {e}")
    finally:
        db.close()