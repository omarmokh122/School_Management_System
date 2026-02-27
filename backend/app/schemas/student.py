from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    grade: Optional[str] = None
    section: Optional[str] = None
    enrollment_date: Optional[date] = None

class StudentCreate(StudentBase):
    school_id: UUID
    parent_id: Optional[UUID] = None

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    grade: Optional[str] = None
    section: Optional[str] = None

class StudentResponse(StudentBase):
    id: UUID
    school_id: UUID
    user_id: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
