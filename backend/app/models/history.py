from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# Ders zorluk seviyeleri için Enum
class DifficultyType(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class History(Base):
    __tablename__ = "histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    given_answer = Column(String(255), nullable=False)
    is_correct = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, nullable=False) # Kaç saniyede çözüldü
    solved_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="histories")
    question = relationship("Question", back_populates="histories")