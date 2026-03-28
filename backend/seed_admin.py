import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select
from backend.database import AsyncSessionLocal
from backend.models import User
import bcrypt

async def seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "admin@mammai.ai"))
        if not result.scalar_one_or_none():
            hashed_pw = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")
            user = User(
                name="Hospital Administrator",
                email="admin@mammai.ai",
                password_hash=hashed_pw,
                role="administrator"
            )
            db.add(user)
            await db.commit()
            print("SUCCESS: Default administrator 'admin@mammai.ai' created.")
        else:
            print("INFO: Default administrator already exists.")

if __name__ == "__main__":
    asyncio.run(seed())
