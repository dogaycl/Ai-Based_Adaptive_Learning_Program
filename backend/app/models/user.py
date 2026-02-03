# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean # <--- Boolean eklendi
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    # FAZ 2 Sütunları
    is_placement_completed = Column(Boolean, default=False)
    current_level = Column(Integer, default=1)

    histories = relationship("History", back_populates="user", cascade="all, delete-orphan")