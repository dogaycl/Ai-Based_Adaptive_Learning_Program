from pydantic import BaseModel
from typing import Optional

class QuestionBase(BaseModel):
    lesson_id: int
    content: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    difficulty_level: int

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int

    class Config:
        from_attributes = True