from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

# -- Classes --
class ClassBase(BaseModel):
    name: str

class ClassCreate(ClassBase):
    school_id: UUID
    teacher_id: UUID

class ClassResponse(ClassBase):
    id: UUID
    school_id: UUID
    teacher_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

# -- Enrollments --
class EnrollmentCreate(BaseModel):
    school_id: UUID
    class_id: UUID
    student_ids: List[UUID]

# -- Curriculum --
class CurriculumBase(BaseModel):
    title: str
    content: Optional[str] = None
    file_url: Optional[str] = None

class CurriculumCreate(CurriculumBase):
    school_id: UUID
    class_id: UUID
    teacher_id: UUID

class CurriculumResponse(CurriculumBase):
    id: UUID
    class_id: UUID
    teacher_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

# -- Assessments --
class AssessmentBase(BaseModel):
    type: str # quiz, exam, mid
    title: str
    max_score: Decimal
    methodology: Optional[str] = None
    ai_generated: bool = False

class AssessmentCreate(AssessmentBase):
    school_id: UUID
    class_id: UUID
    teacher_id: UUID

class AssessmentResponse(AssessmentBase):
    id: UUID
    class_id: UUID
    teacher_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

# -- Grades --
class GradeBase(BaseModel):
    score: Decimal
    remarks: Optional[str] = None

class GradeCreate(GradeBase):
    school_id: UUID
    student_id: UUID
    assessment_id: UUID

class GradeResponse(GradeBase):
    id: UUID
    student_id: UUID
    assessment_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True
