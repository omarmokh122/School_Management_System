import uuid
from sqlalchemy import Column, String, Time, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class ScheduleSlot(Base, TimestampMixin):
    __tablename__ = "schedule_slots"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id  = Column(UUID(as_uuid=True), ForeignKey("schools.id"),   nullable=False, index=True)
    class_id   = Column(UUID(as_uuid=True), ForeignKey("classes.id"),   nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"),  nullable=False, index=True)

    # e.g. "Sunday", "Monday" ... "Thursday"
    day_of_week = Column(String, nullable=False)
    # 1-8
    period      = Column(Integer, nullable=False)
    start_time  = Column(Time, nullable=False)
    end_time    = Column(Time, nullable=False)
    room        = Column(String, nullable=True)
