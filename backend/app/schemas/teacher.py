from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class TeacherBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: str
    hire_date: Optional[date] = None
    avatar_url: Optional[str] = None

class TeacherCreate(TeacherBase):
    school_id: UUID
    user_id: Optional[UUID] = None

class TeacherUpdate(BaseModel):
    specialization: Optional[str] = None
    hire_date: Optional[date] = None

class TeacherResponse(TeacherBase):
    id: UUID
    school_id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
