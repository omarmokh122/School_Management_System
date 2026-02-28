import uuid
from sqlalchemy import Column, String, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class AttendanceRecord(Base, TimestampMixin):
    __tablename__ = "attendance_records"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id  = Column(UUID(as_uuid=True), ForeignKey("schools.id"),   nullable=False, index=True)
    class_id   = Column(UUID(as_uuid=True), ForeignKey("classes.id"),   nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"),  nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"),  nullable=True)

    date   = Column(Date, nullable=False, index=True)
    # present | absent | late | excused
    status = Column(String(20), nullable=False, default="present")
    notes  = Column(Text, nullable=True)
