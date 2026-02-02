from pydantic import BaseModel
from typing import List


class QuestionBase(BaseModel):
    text: str
    difficulty: str
    lesson_id: int


class QuestionCreate(QuestionBase):
    pass


class QuestionResponse(QuestionBase):
    id: int

    class Config:
        from_attributes = True
