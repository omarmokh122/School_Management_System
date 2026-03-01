from pydantic import BaseModel
from typing import Optional


class TeacherToolRequest(BaseModel):
    tool: str          # lesson_plan | quiz | student_report | parent_email | differentiate
    curriculum_context: Optional[str] = None   # extracted text from the uploaded curriculum file
    topic: str = ""
    grade: str = ""
    objectives: str = ""
    difficulty: str = "متوسط"
    num_questions: int = 10
    student_name: str = ""
    strengths: str = ""
    areas_to_improve: str = ""
    subject: str = ""
    parent_name: str = ""
    student_issue: str = ""
    content: str = ""
    reading_level: str = "متوسط"
    language: str = "العربية"
    additional_notes: str = ""


class TeacherToolResponse(BaseModel):
    result: str
    tool: str
