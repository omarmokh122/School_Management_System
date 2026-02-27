from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

class FinancialRecordBase(BaseModel):
    student_id: UUID
    amount: Decimal = Field(gt=0)
    type: str # 'invoice' or 'payment'
    status: str = "pending" # 'pending', 'paid', 'overdue'
    due_date: date
    description: Optional[str] = None

class FinancialRecordCreate(FinancialRecordBase):
    school_id: UUID

class FinancialRecordUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    type: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None

class FinancialRecordResponse(FinancialRecordBase):
    id: UUID
    school_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
