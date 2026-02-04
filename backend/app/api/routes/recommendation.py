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
    
    # --- SENARYO 1: YENİ KULLANICI (HİÇ VERİ YOK) ---
    if not lesson_breakdown:
        return {
            "title": "Welcome, Future Expert! 🚀",
            "message": "I'm your AI Coach. To build your personalized path, I need to see you in action!",
            "recommended_action": "Start Diagnostic Test",
            "reason": "We need to calibrate your learning map.",
            "adaptive_tip": "Don't worry about mistakes. Just do your best!",
            "priority": "high",
            "is_critical": False,
            "target_lesson": None
        }
    
    # En zayıf dersi bul
    weakest_lesson = min(lesson_breakdown, key=lesson_breakdown.get)
    success_rate = lesson_breakdown[weakest_lesson]
    
    avg_time = total_stats.get("avg_time", 30) 
    
    # --- MOTIVATIONAL AI LOGIC (COACH MODE) ---
    is_critical = False
    title = ""
    message = ""
    
    if success_rate < 45:
        # Durum: Kritik (Ama destekleyici dil)
        is_critical = True
        title = "We believe in you! 💪"
        action = "Review & Retry"
        reason = f"It seems '{weakest_lesson}' is a bit tricky right now ({int(success_rate)}%). That's totally normal!"
        message = "Success isn't about never failing, it's about never quitting. Let's look at the materials again."
        tip = "Take your time reading the PDF summary before the quiz. No rush!"
        
    elif success_rate < 75:
        # Durum: Gelişiyor (Hız ve Dikkat analizi)
        title = "Great progress! 🌟"
        if avg_time < 15: 
            action = "Slow Down a Bit"
            reason = "You have the speed of a cheetah, but let's sharpen the accuracy."
            message = "You're answering very fast. If we slow down just a little, your score will skyrocket!"
            tip = "Read the question twice. The answer is often hiding in the details."
        else:
            action = "Reinforce Knowledge"
            reason = f"You're doing well in '{weakest_lesson}', just a few steps away from mastery."
            message = "You are building a solid foundation. Keep pushing!"
            tip = "Try solving similar questions to turn that 'Good' into 'Perfect'."
    else:
        # Durum: Usta (Challenge Modu)
        title = "You're on Fire! 🔥"
        action = "Level Up Challenge"
        reason = f"You've dominated '{weakest_lesson}'. It's too easy for you now."
        message = "Excellent work! I'm updating your curriculum to include more advanced challenges."
        tip = "You're ready for the Hard mode. Let's test your limits!"

    return {
        "title": title,                 # UI Başlığı (Yeni)
        "message": message,             # UI Motivasyon Mesajı (Yeni)
        "recommended_action": action,   # Buton Metni
        "reason": reason,               # Analiz Nedeni
        "adaptive_tip": tip,            # İpucu
        "priority": "high" if is_critical else "normal",
        "is_critical": is_critical,
        "target_lesson": weakest_lesson
    }