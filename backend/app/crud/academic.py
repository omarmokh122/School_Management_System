from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.academic import Class, ClassEnrollment, Curriculum, Assessment, Grade
from app.schemas.academic import ClassCreate, CurriculumCreate, AssessmentCreate, GradeCreate

class CRUDAcademic:
    
    # -- Classes --
    async def create_class(self, db: AsyncSession, obj_in: ClassCreate) -> Class:
        db_obj = Class(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_classes_by_teacher(self, db: AsyncSession, school_id: UUID, teacher_id: UUID) -> List[Class]:
        result = await db.execute(
            select(Class).filter(Class.school_id == school_id, Class.teacher_id == teacher_id)
        )
        return list(result.scalars().all())

    # -- Enrollments --
    async def enroll_students(self, db: AsyncSession, school_id: UUID, class_id: UUID, student_ids: List[UUID]):
        # Quick robust insert (ignoring duplicates for now based on UI logic)
        for s_id in student_ids:
            enrollment = ClassEnrollment(school_id=school_id, class_id=class_id, student_id=s_id)
            db.add(enrollment)
        await db.commit()
        return True

    # -- Curriculum --
    async def create_curriculum(self, db: AsyncSession, obj_in: CurriculumCreate) -> Curriculum:
        db_obj = Curriculum(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_curriculum(self, db: AsyncSession, school_id: UUID, class_id: UUID) -> List[Curriculum]:
        result = await db.execute(
            select(Curriculum).filter(Curriculum.school_id == school_id, Curriculum.class_id == class_id)
        )
        return list(result.scalars().all())

    # -- Assessments --
    async def create_assessment(self, db: AsyncSession, obj_in: AssessmentCreate) -> Assessment:
        db_obj = Assessment(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_assessments(self, db: AsyncSession, school_id: UUID, class_id: UUID) -> List[Assessment]:
        result = await db.execute(
            select(Assessment).filter(Assessment.school_id == school_id, Assessment.class_id == class_id)
        )
        return list(result.scalars().all())

    # -- Grades --
    async def submit_grade(self, db: AsyncSession, obj_in: GradeCreate) -> Grade:
        db_obj = Grade(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
        
    async def get_grades(self, db: AsyncSession, school_id: UUID, assessment_id: UUID) -> List[Grade]:
        result = await db.execute(
            select(Grade).filter(Grade.school_id == school_id, Grade.assessment_id == assessment_id)
        )
        return list(result.scalars().all())

academic = CRUDAcademic()
