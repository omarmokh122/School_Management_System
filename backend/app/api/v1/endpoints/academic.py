from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.schemas import academic as schemas
from app.crud.academic import academic as crud_academic

router = APIRouter()

def validate_school_id(school_id: str) -> UUID:
    try:
        return UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")

# -- Classes --
@router.post("/classes", response_model=schemas.ClassResponse)
async def create_class(
    class_in: schemas.ClassCreate,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    tenant_uuid = validate_school_id(school_id)
    if class_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cross-tenant request blocked")
    return await crud_academic.create_class(db, obj_in=class_in)

@router.get("/classes/matrix", response_model=List[schemas.ClassMatrixResponse])
async def get_classes_matrix(
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Get the master matrix of all classes for the school manager.
    Includes teacher names and student enrollment counts.
    """
    tenant_uuid = validate_school_id(school_id)
    return await crud_academic.get_classes_matrix(db, school_id=tenant_uuid)

@router.get("/classes/teacher/{teacher_id}", response_model=List[schemas.ClassResponse])
async def get_teacher_classes(
    teacher_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    tenant_uuid = validate_school_id(school_id)
    return await crud_academic.get_classes_by_teacher(db, school_id=tenant_uuid, teacher_id=teacher_id)

# -- Enrollments --
@router.post("/enrollments")
async def enroll_students(
    enrollment_in: schemas.EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    tenant_uuid = validate_school_id(school_id)
    if enrollment_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cross-tenant request blocked")
    await crud_academic.enroll_students(db, tenant_uuid, enrollment_in.class_id, enrollment_in.student_ids)
    return {"status": "success", "message": f"Enrolled {len(enrollment_in.student_ids)} students"}

# -- Curriculums --
@router.post("/curriculum", response_model=schemas.CurriculumResponse)
async def upload_curriculum(
    curriculum_in: schemas.CurriculumCreate,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    tenant_uuid = validate_school_id(school_id)
    if curriculum_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cross-tenant request blocked")
    return await crud_academic.create_curriculum(db, obj_in=curriculum_in)

# -- Assessments --
@router.post("/assessments", response_model=schemas.AssessmentResponse)
async def create_assessment(
    assessment_in: schemas.AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    # This endpoint could trigger the n8n webhook behind the scenes if `ai_generated=True`
    tenant_uuid = validate_school_id(school_id)
    if assessment_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cross-tenant request blocked")
    return await crud_academic.create_assessment(db, obj_in=assessment_in)

# -- Grades --
@router.post("/grades", response_model=schemas.GradeResponse)
async def submit_grade(
    grade_in: schemas.GradeCreate,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    tenant_uuid = validate_school_id(school_id)
    if grade_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cross-tenant request blocked")
    return await crud_academic.submit_grade(db, obj_in=grade_in)
