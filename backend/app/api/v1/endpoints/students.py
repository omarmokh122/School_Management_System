from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.crud import student as crud_student

router = APIRouter()

@router.get("/", response_model=List[StudentResponse])
async def read_students(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    """
    Retrieve students for the current tenant's school.
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format in token")
    
    students = await crud_student.get_multi(db, school_id=tenant_uuid, skip=skip, limit=limit)
    return students

@router.post("/", response_model=StudentResponse)
async def create_student(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    student_in: StudentCreate,
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Create new student (Admin only).
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")
        
    if student_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cannot create a student for a different school")
        
    student_created = await crud_student.create(db, obj_in=student_in)
    return student_created

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    *,
    db: AsyncSession = Depends(get_db),
    student_id: UUID,
    student_in: StudentUpdate,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Update a student (Admin only).
    """
    tenant_uuid = UUID(school_id)
    student = await crud_student.get_by_id(db, school_id=tenant_uuid, student_id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_updated = await crud_student.update(db, school_id=tenant_uuid, db_obj=student, obj_in=student_in)
    return student_updated

@router.delete("/{student_id}", response_model=StudentResponse)
async def delete_student(
    *,
    db: AsyncSession = Depends(get_db),
    student_id: UUID,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Delete a student (Admin only).
    """
    tenant_uuid = UUID(school_id)
    student = await crud_student.get_by_id(db, school_id=tenant_uuid, student_id=student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    deleted_student = await crud_student.remove(db, school_id=tenant_uuid, id=student_id)
    return deleted_student
