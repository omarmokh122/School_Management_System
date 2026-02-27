import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class School(Base, TimestampMixin):
    __tablename__ = "schools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    domain = Column(String, unique=True, index=True, nullable=True)
    subscription_plan = Column(String, default="free")
    status = Column(String, default="active")
