from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate

class CRUDTeacher:
    async def get_by_id(self, db: AsyncSession, school_id: UUID, teacher_id: UUID) -> Optional[Teacher]:
        result = await db.execute(
            select(Teacher).filter(Teacher.id == teacher_id, Teacher.school_id == school_id)
        )
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, school_id: UUID, skip: int = 0, limit: int = 100) -> List[Teacher]:
        result = await db.execute(
            select(Teacher).filter(Teacher.school_id == school_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: TeacherCreate) -> Teacher:
        db_obj = Teacher(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, school_id: UUID, db_obj: Teacher, obj_in: TeacherUpdate) -> Teacher:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, school_id: UUID, id: UUID) -> Teacher:
        obj = await self.get_by_id(db, school_id=school_id, teacher_id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

teacher = CRUDTeacher()
