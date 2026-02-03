from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token

class AuthService:
    def __init__(self):
        self.user_repository = UserRepository()

    # ======================
    # REGISTER (password hashed)
    # ======================
    def register(self, db: Session, username, email, password, role):
        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            role=role,
            is_placement_completed=False,
            current_level=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    # ======================
    # LOGIN
    # ======================
    def login(self, db: Session, email: str, password: str):
        user = self.user_repository.get_by_email(db, email)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        access_token = create_access_token(
            data={
                "sub": user.email,
                "role": user.role,
                "id": user.id
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    # ======================
    # UPDATE PLACEMENT STATUS
    # ======================
    def update_placement_status(self, db: Session, user_id: int, level: int):
        """Updates the student's level and marks the diagnostic test as completed."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_placement_completed = True
            user.current_level = level
            db.commit()
            db.refresh(user)
        return user