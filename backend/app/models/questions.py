from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    content = Column(Text, nullable=False)
    
    # Çoktan seçmeli şıklar
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    
    correct_answer = Column(String(1), nullable=False) # 'A', 'B', 'C' veya 'D'
    difficulty_level = Column(Integer, default=1)  # 1-5 arası

    # İlişkiler
    lesson = relationship("Lesson", back_populates="questions")
    histories = relationship("History", back_populates="question", cascade="all, delete-orphan")