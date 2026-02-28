import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class CalendarEvent(Base, TimestampMixin):
    __tablename__ = "calendar_events"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"),  nullable=False, index=True)
    class_id  = Column(UUID(as_uuid=True), ForeignKey("classes.id"),  nullable=True)

    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    # exam | holiday | meeting | activity
    event_type  = Column(String(20), nullable=False, default="activity")
    start_date  = Column(Date, nullable=False, index=True)
    end_date    = Column(Date, nullable=False)
