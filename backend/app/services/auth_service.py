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
    def register(self, db, username, email, password, role):
        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            role=role
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

        if not verify_password(password, user.password):
            return None

        access_token = create_access_token(
            data={
                "sub": user.email,
                "role": user.role
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
