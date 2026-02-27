import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class Student(Base, TimestampMixin):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    grade = Column(String, nullable=True)
    section = Column(String, nullable=True)
    enrollment_date = Column(Date, nullable=True)
