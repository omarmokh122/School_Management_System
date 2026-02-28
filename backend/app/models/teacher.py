import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class Teacher(Base, TimestampMixin):
    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    
    specialization = Column(String, nullable=False)
    hire_date = Column(Date, nullable=True)

    first_name = Column(String, nullable=False, default="")
    last_name = Column(String, nullable=False, default="")
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
