import uuid
from sqlalchemy import Column, String, Numeric, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class Class(Base, TimestampMixin):
    __tablename__ = "classes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=True)  # Math, English, Arabic, Science, etc.
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"), nullable=False, index=True)

class ClassEnrollment(Base, TimestampMixin):
    __tablename__ = "class_enrollments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True)

class Curriculum(Base, TimestampMixin):
    __tablename__ = "curriculums"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)     # Markdown or text outline
    file_url = Column(String, nullable=True)  # URL to PDF/attachment

class Assessment(Base, TimestampMixin):
    __tablename__ = "assessments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"), nullable=False, index=True)
    type = Column(String, nullable=False)     # quiz, exam, mid
    title = Column(String, nullable=False)
    max_score = Column(Numeric(5, 2), nullable=False)
    methodology = Column(String, nullable=True)
    ai_generated = Column(Boolean, default=False)

class Grade(Base, TimestampMixin):
    __tablename__ = "grades"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False, index=True)
    score = Column(Numeric(5, 2), nullable=False)
    remarks = Column(String, nullable=True)
