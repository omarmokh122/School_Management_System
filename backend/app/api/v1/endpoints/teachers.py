from typing import List
from uuid import UUID
import secrets, string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.api import dependencies
from app.db.session import get_db
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from app.crud import teacher as crud_teacher
from app.core.config import settings

router = APIRouter()

# ── Helper ─────────────────────────────────────────────────────────────────
def _make_supabase_admin():
    """Return a Supabase client with the service role key (bypasses RLS)."""
    try:
        from supabase import create_client
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    except Exception:
        return None

def _random_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$"
    return ''.join(secrets.choice(chars) for _ in range(length))

# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/", response_model=List[TeacherResponse])
async def read_teachers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format in token")
    teachers = await crud_teacher.get_multi(db, school_id=tenant_uuid, skip=skip, limit=limit)
    return teachers


@router.get("/{teacher_id}", response_model=TeacherResponse)
async def read_teacher(
    teacher_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    tenant_uuid = UUID(school_id)
    teacher = await crud_teacher.get_by_id(db, school_id=tenant_uuid, teacher_id=teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.post("/", response_model=TeacherResponse)
async def create_teacher(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    teacher_in: TeacherCreate,
    _ = Depends(dependencies.require_role(["Admin"])),
):
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")
    if teacher_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cannot create a teacher for a different school")
    teacher_created = await crud_teacher.create(db, obj_in=teacher_in)
    return teacher_created


class TeacherAccountCreate(BaseModel):
    email: str

@router.post("/{teacher_id}/create-account")
async def create_teacher_account(
    teacher_id: UUID,
    payload: TeacherAccountCreate,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"])),
):
    """
    Create a Supabase auth account for a teacher so they can log in.
    Returns a temporary password that the admin can share with the teacher.
    """
    tenant_uuid = UUID(school_id)
    teacher = await crud_teacher.get_by_id(db, school_id=tenant_uuid, teacher_id=teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    supabase = _make_supabase_admin()
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client unavailable")

    temp_password = _random_password()
    try:
        res = supabase.auth.admin.create_user({
            "email": payload.email,
            "password": temp_password,
            "email_confirm": True,
            "user_metadata": {
                "role": "Teacher",
                "school_id": str(school_id),
                "teacher_id": str(teacher_id),
                "first_name": teacher.first_name,
                "last_name": teacher.last_name,
            },
        })
        if hasattr(res, 'user') and res.user:
            return {
                "status": "success",
                "message": "تم إنشاء حساب المعلم بنجاح",
                "email": payload.email,
                "temp_password": temp_password,
                "user_id": str(res.user.id),
            }
        raise HTTPException(status_code=400, detail="فشل إنشاء الحساب - قد يكون البريد الإلكتروني مستخدماً مسبقاً")
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg or "already exists" in error_msg:
            raise HTTPException(status_code=409, detail="البريد الإلكتروني مستخدم بالفعل")
        raise HTTPException(status_code=500, detail=f"خطأ في إنشاء الحساب: {error_msg}")


@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    *,
    db: AsyncSession = Depends(get_db),
    teacher_id: UUID,
    teacher_in: TeacherUpdate,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"])),
):
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
    _ = Depends(dependencies.require_role(["Admin"])),
):
    tenant_uuid = UUID(school_id)
    teacher = await crud_teacher.get_by_id(db, school_id=tenant_uuid, teacher_id=teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    deleted_teacher = await crud_teacher.remove(db, school_id=tenant_uuid, id=teacher_id)
    return deleted_teacher

