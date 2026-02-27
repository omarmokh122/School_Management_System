from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate

class CRUDStudent:
    async def get_by_id(self, db: AsyncSession, school_id: UUID, student_id: UUID) -> Optional[Student]:
        result = await db.execute(
            select(Student).filter(Student.id == student_id, Student.school_id == school_id)
        )
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, school_id: UUID, skip: int = 0, limit: int = 100) -> List[Student]:
        result = await db.execute(
            select(Student).filter(Student.school_id == school_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: StudentCreate) -> Student:
        db_obj = Student(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, school_id: UUID, db_obj: Student, obj_in: StudentUpdate) -> Student:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, school_id: UUID, id: UUID) -> Student:
        obj = await self.get_by_id(db, school_id=school_id, student_id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

student = CRUDStudent()
