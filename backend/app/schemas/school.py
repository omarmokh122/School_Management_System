from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class SchoolBase(BaseModel):
    name: str
    domain: Optional[str] = None
    subscription_plan: Optional[str] = "free"

class SchoolCreate(SchoolBase):
    pass

class SchoolResponse(SchoolBase):
    id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
