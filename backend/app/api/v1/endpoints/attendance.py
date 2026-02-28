from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.crud import new_modules as crud

router = APIRouter()

@router.get("/{class_id}", response_model=List[dict])
async def get_attendance(
    class_id: UUID,
    date: str,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    return await crud.get_class_attendance(db, UUID(school_id), class_id, date)

@router.post("/bulk", response_model=dict, status_code=201)
async def submit_bulk_attendance(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    body: dict,
):
    teacher_id = UUID(str(body["teacher_id"])) if body.get("teacher_id") else None
    count = await crud.bulk_upsert_attendance(
        db,
        school_id=UUID(school_id),
        class_id=UUID(str(body["class_id"])),
        teacher_id=teacher_id,
        date_str=body["date"],
        records=body.get("records", []),
    )
    return {"saved": count}

@router.get("/student/{student_id}/summary", response_model=dict)
async def student_attendance_summary(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    return await crud.get_student_attendance_summary(db, UUID(school_id), student_id)
