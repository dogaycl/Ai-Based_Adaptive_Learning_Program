from pydantic import BaseModel
from typing import Optional

class LessonBase(BaseModel):
    title: str
    # Optional ve varsayılan değerler vererek boş verilerin hataya sebep olmasını engelliyoruz
    description: Optional[str] = ""
    content_text: Optional[str] = ""
    attachment_url: Optional[str] = ""
    difficulty: str = "medium"

class LessonCreate(LessonBase):
    pass

class LessonResponse(LessonBase):
    id: int

    class Config:
        # SQLAlchemy objelerini Pydantic'e dönüştürmek için bu şart!
        from_attributes = True