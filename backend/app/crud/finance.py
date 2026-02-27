from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.finance import FinancialRecord
from app.schemas.finance import FinancialRecordCreate, FinancialRecordUpdate

class CRUDFinancialRecord:
    async def get_by_id(self, db: AsyncSession, school_id: UUID, record_id: UUID) -> Optional[FinancialRecord]:
        result = await db.execute(
            select(FinancialRecord).filter(FinancialRecord.id == record_id, FinancialRecord.school_id == school_id)
        )
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, school_id: UUID, skip: int = 0, limit: int = 100) -> List[FinancialRecord]:
        result = await db.execute(
            select(FinancialRecord).filter(FinancialRecord.school_id == school_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
        
    async def get_by_student(self, db: AsyncSession, school_id: UUID, student_id: UUID) -> List[FinancialRecord]:
        result = await db.execute(
            select(FinancialRecord).filter(
                FinancialRecord.school_id == school_id, 
                FinancialRecord.student_id == student_id
            ).order_by(FinancialRecord.due_date.desc())
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: FinancialRecordCreate) -> FinancialRecord:
        db_obj = FinancialRecord(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, school_id: UUID, db_obj: FinancialRecord, obj_in: FinancialRecordUpdate) -> FinancialRecord:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, school_id: UUID, id: UUID) -> FinancialRecord:
        obj = await self.get_by_id(db, school_id=school_id, record_id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

financial_record = CRUDFinancialRecord()
