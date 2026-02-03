from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.history_service import HistoryService
from app.models.lessons import Lesson

router = APIRouter(prefix="/recommendation", tags=["AI Recommendation"])
history_service = HistoryService()

@router.get("/next-step/{user_id}")
def get_ai_recommendation(user_id: int, db: Session = Depends(get_db)):
    summary = history_service.get_user_summary(db, user_id)
    lesson_breakdown = summary.get("lesson_breakdown", {})
    total_stats = summary.get("total_stats", {})
    
    # Eğer hiç ders çözülmediyse (Yeni Kullanıcı)
    if not lesson_breakdown:
        return {
            "recommended_action": "İlk Adımı At: Seviye Belirleme",
            "reason": "Seni henüz tanımıyorum! Sistemdeki dersleri keşfetmeye başla.",
            "adaptive_tip": "Önce 'Easy' (Kolay) seviyedeki dökümanları okumanı öneririm.",
            "priority": "high"
        }
    
    # En zayıf halkayı bul (En düşük başarılı ders)
    weakest_lesson_id = min(lesson_breakdown, key=lesson_breakdown.get)
    success_rate = lesson_breakdown[weakest_lesson_id]
    
    # Ortalama süreyi kontrol et (Öğrenci acele mi ediyor yoksa çok mu yavaş?)
    avg_time = total_stats.get("avg_time", 30) 
    
    # --- GELİŞMİŞ AI MANTIĞI ---
    if success_rate < 40:
        action = f"Kritik Tekrar: {weakest_lesson_id}"
        reason = f"Bu konuda başarı oranınız %{int(success_rate)}. Temelleri henüz oturtamamışsınız."
        tip = "Soruları çözmeden önce ders dökümanındaki PDF'i tekrar incele. Acele etme, odaklanarak oku."
    elif success_rate < 75:
        if avg_time < 15: # Çok hızlı ama hatalı
            action = f"Odaklanma Pratiği: {weakest_lesson_id}"
            reason = "Hızlısın ama çok hata yapıyorsun. AI, soruları daha dikkatli okuman gerektiğini analiz etti."
            tip = "Soruyu yanıtlamadan önce en az 5 saniye düşünmeye çalış."
        else:
            action = f"Pekiştirme Zamanı: {weakest_lesson_id}"
            reason = "Konuyu anladın ama henüz uzmanlaşmadın."
            tip = "Benzer zorluktaki derslerle XP kazanmaya devam et."
    else:
        # Başarı %75 üstü ise zorluğu arttır
        action = "Yeni Meydan Okuma: Zor Seviye"
        reason = "Mevcut konuları domine ettin. Yapay zeka senin için çıtayı yükseltiyor!"
        tip = "Artık 'Hard' seviye derslere geçerek gerçek potansiyelini kanıtla."

    return {
        "recommended_action": action,
        "reason": reason,
        "adaptive_tip": tip,
        "priority": "normal"
    }