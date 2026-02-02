from sqlalchemy import Column, Integer, String, Text,DateTime, Enum as SQLEnum

from sqlalchemy.orm import relationship

import enum
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Ders zorluk seviyeleri için Enum
class DifficultyType(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    # SQLAlchemy'de Enum kullanımı
    difficulty = Column(SQLEnum(DifficultyType), default=DifficultyType.MEDIUM)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Derse ait sorular
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")

