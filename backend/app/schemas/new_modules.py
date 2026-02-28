from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import time, datetime

# ─── Schedule ───────────────────────────────────────────────────────────────
class ScheduleSlotBase(BaseModel):
    class_id:    UUID
    teacher_id:  UUID
    day_of_week: str   # Sunday … Thursday
    period:      int   # 1-8
    start_time:  time
    end_time:    time
    room:        Optional[str] = None

class ScheduleSlotCreate(ScheduleSlotBase):
    school_id: UUID

class ScheduleSlotResponse(ScheduleSlotBase):
    id:          UUID
    school_id:   UUID
    class_name:  Optional[str] = None
    teacher_name: Optional[str] = None
    created_at:  datetime
    class Config:
        from_attributes = True


# ─── Attendance ─────────────────────────────────────────────────────────────
class AttendanceRecordBase(BaseModel):
    class_id:   UUID
    student_id: UUID
    date:       str    # ISO date string
    status:     str    # present | absent | late | excused
    notes:      Optional[str] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    school_id:  UUID
    teacher_id: Optional[UUID] = None

class AttendanceBulkCreate(BaseModel):
    school_id:  UUID
    class_id:   UUID
    teacher_id: Optional[UUID] = None
    date:       str
    records:    List[dict]  # [{student_id, status, notes}]

class AttendanceRecordResponse(AttendanceRecordBase):
    id:          UUID
    school_id:   UUID
    teacher_id:  Optional[UUID] = None
    student_name: Optional[str] = None
    created_at:  datetime
    class Config:
        from_attributes = True


# ─── Announcement ────────────────────────────────────────────────────────────
class AnnouncementBase(BaseModel):
    title:    str
    body:     str
    audience: str = "all"   # all | teachers | students | parents
    priority: str = "normal"  # normal | urgent
    expires_at: Optional[str] = None

class AnnouncementCreate(AnnouncementBase):
    school_id: UUID
    author_id: Optional[UUID] = None

class AnnouncementResponse(AnnouncementBase):
    id:         UUID
    school_id:  UUID
    author_id:  Optional[UUID] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Calendar ────────────────────────────────────────────────────────────────
class CalendarEventBase(BaseModel):
    title:       str
    description: Optional[str] = None
    event_type:  str = "activity"  # exam | holiday | meeting | activity
    start_date:  str
    end_date:    str
    class_id:    Optional[UUID] = None

class CalendarEventCreate(CalendarEventBase):
    school_id: UUID

class CalendarEventResponse(CalendarEventBase):
    id:         UUID
    school_id:  UUID
    created_at: datetime
    class Config:
        from_attributes = True
