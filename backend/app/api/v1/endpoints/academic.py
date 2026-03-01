from typing import List
from uuid import UUID
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.api import dependencies
from app.db.session import get_db
from app.schemas import academic as schemas
from app.crud.academic import academic as crud_academic
from app.models.academic import Curriculum

router = APIRouter()

def validate_school_id(school_id: str) -> UUID:
    try:
        return UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")


def _extract_text(filename: str, data: bytes) -> str:
    """Extract plain text from PDF or DOCX bytes."""
    ext = filename.lower().rsplit(".", 1)[-1]
    try:
        if ext == "pdf":
            import pdfplumber
            with pdfplumber.open(io.BytesIO(data)) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages)
        elif ext in ("docx", "doc"):
            from docx import Document
            doc = Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        elif ext == "txt":
            return data.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Use PDF, DOCX, or TXT.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text from file: {str(e)}")



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

@router.get("/enrollments/{class_id}")
async def get_class_students(
    class_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"]))
):
    """Get all students enrolled in a class."""
    tenant_uuid = validate_school_id(school_id)
    students = await crud_academic.get_students_in_class(db, school_id=tenant_uuid, class_id=class_id)
    return students

# -- Curriculum File Upload --
@router.post("/curriculum/upload/{class_id}")
async def upload_curriculum_file(
    class_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    current_user: dict = Depends(dependencies.get_current_user),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"])),
):
    """Upload a PDF/DOCX curriculum file for a class. Extracts text for AI context."""
    tenant_uuid = validate_school_id(school_id)

    # 10 MB limit
    MAX_SIZE = 10 * 1024 * 1024
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    extracted_text = _extract_text(file.filename or "file.pdf", data)
    if not extracted_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the file. Make sure it's not a scanned image PDF.")

    teacher_id_str = current_user.get("user_metadata", {}).get("teacher_id")
    teacher_uuid = None
    if teacher_id_str:
        try:
            teacher_uuid = UUID(teacher_id_str)
        except (ValueError, TypeError):
            pass

    # Upsert: delete existing curriculum for this class first
    await db.execute(delete(Curriculum).where(
        Curriculum.class_id == class_id,
        Curriculum.school_id == tenant_uuid,
    ))

    curriculum = Curriculum(
        school_id=tenant_uuid,
        class_id=class_id,
        teacher_id=teacher_uuid or UUID("00000000-0000-0000-0000-000000000000"),
        title=file.filename or "Curriculum",
        content=extracted_text,          # full extracted text
        file_url=file.filename or "",   # just filename (no storage bucket needed)
    )
    db.add(curriculum)
    await db.commit()
    await db.refresh(curriculum)

    return {
        "id": str(curriculum.id),
        "class_id": str(class_id),
        "file_name": file.filename,
        "char_count": len(extracted_text),
        "preview": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text,
    }


@router.get("/curriculum/{class_id}")
async def get_curriculum(
    class_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.get_current_user),
):
    """Get the curriculum for a specific class."""
    tenant_uuid = validate_school_id(school_id)
    result = await db.execute(
        select(Curriculum).where(
            Curriculum.class_id == class_id,
            Curriculum.school_id == tenant_uuid,
        )
    )
    curriculum = result.scalar_one_or_none()
    if not curriculum:
        return {"found": False, "class_id": str(class_id)}
    return {
        "found": True,
        "id": str(curriculum.id),
        "class_id": str(class_id),
        "file_name": curriculum.file_url or curriculum.title,
        "char_count": len(curriculum.content or ""),
        "content": curriculum.content or "",
        "created_at": curriculum.created_at.isoformat() if curriculum.created_at else None,
    }


@router.delete("/curriculum/{class_id}")
async def delete_curriculum(
    class_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Teacher"])),
):
    """Delete the curriculum for a class."""
    tenant_uuid = validate_school_id(school_id)
    await db.execute(delete(Curriculum).where(
        Curriculum.class_id == class_id,
        Curriculum.school_id == tenant_uuid,
    ))
    await db.commit()
    return {"deleted": True, "class_id": str(class_id)}


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
