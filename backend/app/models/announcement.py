import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class Announcement(Base, TimestampMixin):
    __tablename__ = "announcements"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"),   nullable=True)

    title    = Column(String, nullable=False)
    body     = Column(Text,   nullable=False)
    # all | teachers | students | parents
    audience = Column(String(20), nullable=False, default="all")
    # normal | urgent
    priority   = Column(String(10), nullable=False, default="normal")
    expires_at = Column(Date, nullable=True)
