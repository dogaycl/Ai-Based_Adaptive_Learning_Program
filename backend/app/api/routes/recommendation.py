from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.history_service import HistoryService

router = APIRouter(prefix="/recommendation", tags=["AI Recommendation"])
history_service = HistoryService()

# app/api/routes/recommendation.py

@router.get("/next-step/{user_id}")
def get_ai_recommendation(user_id: int, db: Session = Depends(get_db)):
    summary = history_service.get_user_summary(db, user_id)
    lesson_breakdown = summary.get("lesson_breakdown", {})
    
    if not lesson_breakdown:
        return {
            "recommended_action": "Start with an Introductory Lesson",
            "reason": "No historical data found. Let's build your foundation.",
            "adaptive_tip": "Focus on completion rather than speed for your first quiz."
        }
    
    # Find the weakest and strongest areas
    weakest_lesson = min(lesson_breakdown, key=lesson_breakdown.get)
    success_rate = lesson_breakdown[weakest_lesson]
    
    # Adaptive Logic
    if success_rate < 50:
        action = f"Review Fundamentals of {weakest_lesson}"
        reason = f"Your accuracy in {weakest_lesson} is below 50%."
        tip = "Try to spend more time reading the questions carefully."
    elif success_rate < 85:
        action = f"Practice Moderate Exercises in {weakest_lesson}"
        reason = f"You are making progress in {weakest_lesson}, but need more consistency."
        tip = "Keep a steady pace; you are almost at mastery level."
    else:
        # If the weakest is already good, suggest a new challenge
        action = "Take a High-Difficulty Challenge"
        reason = "You have mastered current topics. Time to push your limits."
        tip = "Try to solve advanced problems to improve your global ranking."

    return {
        "recommended_action": action,
        "reason": reason,
        "adaptive_tip": tip
    }