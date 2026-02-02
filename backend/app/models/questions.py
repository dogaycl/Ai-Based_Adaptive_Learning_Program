from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

# Ders zorluk seviyeleri için Enum
class DifficultyType(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    content = Column(Text, nullable=False)
    correct_answer = Column(String(255), nullable=False)
    difficulty_level = Column(Integer, default=1)  # 1-5 arası puanlama gibi

    # İlişkiler
    lesson = relationship("Lesson", back_populates="questions")
    histories = relationship("History", back_populates="question", cascade="all, delete-orphan")

