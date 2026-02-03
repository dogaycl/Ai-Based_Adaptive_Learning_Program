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
    
    # New User Scenario
    if not lesson_breakdown:
        return {
            "recommended_action": "Start Diagnostic Test",
            "reason": "AI needs initial data to build your learning profile.",
            "adaptive_tip": "Take the placement test to unlock personalized content.",
            "priority": "high",
            "is_critical": False,
            "target_lesson": None
        }
    
    # Find weakest area
    weakest_lesson = min(lesson_breakdown, key=lesson_breakdown.get)
    success_rate = lesson_breakdown[weakest_lesson]
    
    avg_time = total_stats.get("avg_time", 30) 
    
    # --- ADVANCED AI LOGIC (ENGLISH) ---
    is_critical = False
    
    if success_rate < 45:
        # Critical Failure Logic
        is_critical = True
        action = "Critical Review Needed"
        reason = f"Your success rate in '{weakest_lesson}' is only {int(success_rate)}%. Foundation is weak."
        tip = "Review the PDF material before attempting more quizzes. Take your time."
        
    elif success_rate < 75:
        # Improvement Logic
        if avg_time < 15: 
            action = "Focus Practice"
            reason = "You are fast but making errors. AI detected rushing behavior."
            tip = "Try to spend at least 10 seconds analyzing the question stem."
        else:
            action = "Deep Practice"
            reason = "Good understanding, but not yet mastered."
            tip = "Continue with similar difficulty to gain more XP."
    else:
        # Mastery Logic
        action = "Challenge: Hard Level"
        reason = "You have dominated this topic. AI is increasing the difficulty."
        tip = "Switch to 'Hard' difficulty questions to test your limits."

    return {
        "recommended_action": action,
        "reason": reason,
        "adaptive_tip": tip,
        "priority": "high" if is_critical else "normal",
        "is_critical": is_critical,
        "target_lesson": weakest_lesson
    }