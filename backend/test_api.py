import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.models.teacher import Teacher
import os

async def test():
    print("Testing DB connection...")

asyncio.run(test())
