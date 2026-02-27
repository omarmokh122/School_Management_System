from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from app.crud import teacher as crud_teacher

router = APIRouter()

@router.get("/", response_model=List[TeacherResponse])
async def read_teachers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    """
    Retrieve teachers for the current tenant's school.
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format in token")
    
    teachers = await crud_teacher.get_multi(db, school_id=tenant_uuid, skip=skip, limit=limit)
    return teachers

@router.post("/", response_model=TeacherResponse)
async def create_teacher(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    teacher_in: TeacherCreate,
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Create new teacher (Admin only).
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")
        
    if teacher_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cannot create a teacher for a different school")
        
    teacher_created = await crud_teacher.create(db, obj_in=teacher_in)
    return teacher_created

@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    *,
    db: AsyncSession = Depends(get_db),
    teacher_id: UUID,
    teacher_in: TeacherUpdate,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Update a teacher (Admin only).
    """
    tenant_uuid = UUID(school_id)
    teacher = await crud_teacher.get_by_id(db, school_id=tenant_uuid, teacher_id=teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
        
    teacher_updated = await crud_teacher.update(db, school_id=tenant_uuid, db_obj=teacher, obj_in=teacher_in)
    return teacher_updated

@router.delete("/{teacher_id}", response_model=TeacherResponse)
async def delete_teacher(
    *,
    db: AsyncSession = Depends(get_db),
    teacher_id: UUID,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Delete a teacher (Admin only).
    """
    tenant_uuid = UUID(school_id)
    teacher = await crud_teacher.get_by_id(db, school_id=tenant_uuid, teacher_id=teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
        
    deleted_teacher = await crud_teacher.remove(db, school_id=tenant_uuid, id=teacher_id)
    return deleted_teacher
