from pydantic import BaseModel
from typing import List, Optional

class ScheduleGenerationRequest(BaseModel):
    subjects: List[str]
    max_hours_per_day: int
    days_per_week: int
    additional_constraints: Optional[str] = None

class ScheduleGenerationResponse(BaseModel):
    schedule: str # AI generated markdown or JSON payload

class MessageDraftRequest(BaseModel):
    topic: str
    tone: str
    audience: str
    additional_context: Optional[str] = None

class MessageDraftResponse(BaseModel):
    draft: str
