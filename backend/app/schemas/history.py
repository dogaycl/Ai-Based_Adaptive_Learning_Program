from pydantic import BaseModel
from datetime import datetime

class HistoryBase(BaseModel):
    question_id: int
    given_answer: str
    time_spent_seconds: int

class HistoryCreate(HistoryBase):
    pass

class HistoryResponse(HistoryBase):
    id: int
    user_id: int
    is_correct: bool
    solved_at: datetime

    class Config:
        from_attributes = True
