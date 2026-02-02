from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.history_service import HistoryService

router = APIRouter(prefix="/recommendation", tags=["AI Recommendation"])
history_service = HistoryService()

@router.get("/next-step/{user_id}")
def get_ai_recommendation(user_id: int, db: Session = Depends(get_db)):
    # Öğrencinin en zayıf olduğu dersi bulup oraya yönlendirme yapıyoruz
    summary = history_service.get_user_summary(db, user_id)
    lesson_breakdown = summary.get("lesson_breakdown", {})
    
    if not lesson_breakdown:
        return {"message": "Henüz yeterli veri yok, rastgele bir dersten başlayabilirsin."}
    
    # En düşük başarı oranına sahip dersi bul
    weakest_lesson = min(lesson_breakdown, key=lesson_breakdown.get)
    
    return {
        "recommended_action": f"Şu an en çok {weakest_lesson} konusuna çalışman gerekiyor.",
        "reason": "Bu dersteki başarı oranın diğerlerinden daha düşük.",
        "adaptive_tip": history_service.get_adaptive_recommendation(db, user_id)
    }
