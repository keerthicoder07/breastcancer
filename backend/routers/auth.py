"""
Auth router — JWT login + register
"""
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import bcrypt
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from pathlib import Path
from dotenv import load_dotenv

from backend.database import get_db
from backend.models import User
from backend.schemas import LoginRequest, RegisterRequest, TokenResponse

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY  = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM   = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRE = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def _verify(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        return False


def _create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("role")
        if role != "administrator":
            raise HTTPException(status_code=403, detail="Administrator access required")
        return payload
    except JWTError:
        raise credentials_exception

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(name=req.name, email=req.email,
                password_hash=_hash(req.password), role=req.role)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = _create_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, user_name=user.name,
                         user_email=user.email, role=user.role)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not _verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = _create_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, user_name=user.name,
                         user_email=user.email, role=user.role)


@router.delete("/users/{email}")
async def delete_user(email: str, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    if admin["email"] == email:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves")
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    return {"status": "success", "detail": "User deleted successfully"}
