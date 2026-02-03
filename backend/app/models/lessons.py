from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class DifficultyType(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    content_text = Column(Text, nullable=True) # Dersin detaylı anlatım metni
    attachment_url = Column(String(255), nullable=True) # PDF veya Görsel linki
    difficulty = Column(SQLEnum(DifficultyType), default=DifficultyType.MEDIUM)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")