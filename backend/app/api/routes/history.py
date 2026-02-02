from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.history import HistoryCreate, HistoryResponse
from app.services.history_service import HistoryService

router = APIRouter(prefix="/history", tags=["Student History"])
history_service = HistoryService()

@router.post("/submit", response_model=HistoryResponse)
def submit_answer(history_data: HistoryCreate, user_id: int, db: Session = Depends(get_db)):
    try:
        return history_service.submit_answer(db, user_id, history_data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/stats/{user_id}")
def get_student_stats(user_id: int, db: Session = Depends(get_db)):
    stats = history_service.get_user_stats(db, user_id)
    if not stats:
        raise HTTPException(status_code=404, detail="İstatistik bulunamadı")
    return stats

@router.get("/summary/{user_id}")
def get_advanced_summary(user_id: int, db: Session = Depends(get_db)):
    # Öğrenciye ait daha fazla detay sunan gelişmiş analiz yolu
    return history_service.get_user_summary(db, user_id)

@router.get("/recommendation/{user_id}")
def get_adaptive_recommendation(user_id: int, db: Session = Depends(get_db)):
    # AI/Adaptif mantığına göre öğrenciye özel yönlendirme
    return history_service.get_adaptive_recommendation(db, user_id)
