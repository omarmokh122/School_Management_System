import uuid
from sqlalchemy import Column, String, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin

class FinancialRecord(Base, TimestampMixin):
    __tablename__ = "financial_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    type = Column(String, nullable=False)  # e.g., "invoice", "payment"
    status = Column(String, nullable=False, default="pending")  # e.g., "pending", "paid", "overdue"
    due_date = Column(Date, nullable=False)
    description = Column(String, nullable=True)
