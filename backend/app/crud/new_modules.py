from uuid import UUID
from typing import List, Optional
from datetime import date as date_type
from sqlalchemy import select, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import ScheduleSlot
from app.models.attendance import AttendanceRecord
from app.models.announcement import Announcement
from app.models.calendar import CalendarEvent
from app.models.academic import Class
from app.models.teacher import Teacher
from app.models.student import Student


# ═══════════════════════════════════════════════════════════════
#  SCHEDULE
# ═══════════════════════════════════════════════════════════════
async def get_school_schedule(db: AsyncSession, school_id: UUID) -> List[dict]:
    result = await db.execute(
        select(ScheduleSlot, Class, Teacher)
        .join(Class,   Class.id   == ScheduleSlot.class_id)
        .join(Teacher, Teacher.id == ScheduleSlot.teacher_id)
        .where(ScheduleSlot.school_id == school_id)
        .order_by(ScheduleSlot.day_of_week, ScheduleSlot.period)
    )
    rows = result.all()
    slots = []
    for slot, cls, teacher in rows:
        slots.append({
            "id":           str(slot.id),
            "school_id":    str(slot.school_id),
            "class_id":     str(slot.class_id),
            "teacher_id":   str(slot.teacher_id),
            "day_of_week":  slot.day_of_week,
            "period":       slot.period,
            "start_time":   str(slot.start_time) if slot.start_time else None,
            "end_time":     str(slot.end_time)   if slot.end_time   else None,
            "room":         slot.room,
            "class_name":   cls.name,
            "subject":      cls.subject,
            "teacher_name": f"{teacher.first_name} {teacher.last_name}",
        })
    return slots

async def create_schedule_slot(db: AsyncSession, obj_in: dict) -> ScheduleSlot:
    slot = ScheduleSlot(**obj_in)
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot

async def delete_schedule_slot(db: AsyncSession, school_id: UUID, slot_id: UUID) -> bool:
    result = await db.execute(
        select(ScheduleSlot).where(
            and_(ScheduleSlot.id == slot_id, ScheduleSlot.school_id == school_id)
        )
    )
    slot = result.scalar_one_or_none()
    if not slot:
        return False
    await db.delete(slot)
    await db.commit()
    return True


# ═══════════════════════════════════════════════════════════════
#  ATTENDANCE
# ═══════════════════════════════════════════════════════════════
async def get_class_attendance(db: AsyncSession, school_id: UUID, class_id: UUID, date_str: str) -> List[dict]:
    result = await db.execute(
        select(AttendanceRecord, Student)
        .join(Student, Student.id == AttendanceRecord.student_id)
        .where(and_(
            AttendanceRecord.school_id == school_id,
            AttendanceRecord.class_id  == class_id,
            AttendanceRecord.date      == date_str,
        ))
    )
    rows = result.all()
    return [{
        "id":           str(r.id),
        "student_id":   str(r.student_id),
        "student_name": f"{s.first_name} {s.last_name}",
        "date":         str(r.date),
        "status":       r.status,
        "notes":        r.notes,
    } for r, s in rows]

async def bulk_upsert_attendance(db: AsyncSession, school_id: UUID, class_id: UUID,
                                  teacher_id: Optional[UUID], date_str: str, records: list) -> int:
    # Delete existing records for this class/date to allow re-submission
    await db.execute(
        delete(AttendanceRecord).where(and_(
            AttendanceRecord.school_id == school_id,
            AttendanceRecord.class_id  == class_id,
            AttendanceRecord.date      == date_str,
        ))
    )
    inserted = 0
    for rec in records:
        obj = AttendanceRecord(
            school_id=school_id,
            class_id=class_id,
            teacher_id=teacher_id,
            student_id=UUID(str(rec["student_id"])),
            date=date_str,
            status=rec.get("status", "present"),
            notes=rec.get("notes"),
        )
        db.add(obj)
        inserted += 1
    await db.commit()
    return inserted

async def get_student_attendance_summary(db: AsyncSession, school_id: UUID, student_id: UUID) -> dict:
    result = await db.execute(
        select(AttendanceRecord).where(and_(
            AttendanceRecord.school_id  == school_id,
            AttendanceRecord.student_id == student_id,
        ))
    )
    records = result.scalars().all()
    summary = {"present": 0, "absent": 0, "late": 0, "excused": 0, "total": len(records)}
    for r in records:
        summary[r.status] = summary.get(r.status, 0) + 1
    return summary


# ═══════════════════════════════════════════════════════════════
#  ANNOUNCEMENTS
# ═══════════════════════════════════════════════════════════════
async def get_announcements(db: AsyncSession, school_id: UUID, audience: Optional[str] = None) -> List[Announcement]:
    q = select(Announcement).where(Announcement.school_id == school_id).order_by(Announcement.created_at.desc())
    if audience and audience != "all":
        q = q.where(Announcement.audience.in_(["all", audience]))
    result = await db.execute(q)
    return result.scalars().all()

async def create_announcement(db: AsyncSession, obj_in: dict) -> Announcement:
    ann = Announcement(**obj_in)
    db.add(ann)
    await db.commit()
    await db.refresh(ann)
    return ann

async def delete_announcement(db: AsyncSession, school_id: UUID, ann_id: UUID) -> bool:
    result = await db.execute(
        select(Announcement).where(and_(Announcement.id == ann_id, Announcement.school_id == school_id))
    )
    ann = result.scalar_one_or_none()
    if not ann:
        return False
    await db.delete(ann)
    await db.commit()
    return True


# ═══════════════════════════════════════════════════════════════
#  CALENDAR EVENTS
# ═══════════════════════════════════════════════════════════════
async def get_calendar_events(db: AsyncSession, school_id: UUID, year: int, month: int) -> List[CalendarEvent]:
    from calendar import monthrange
    first = date_type(year, month, 1)
    last  = date_type(year, month, monthrange(year, month)[1])
    result = await db.execute(
        select(CalendarEvent).where(and_(
            CalendarEvent.school_id  == school_id,
            CalendarEvent.start_date <= str(last),
            CalendarEvent.end_date   >= str(first),
        )).order_by(CalendarEvent.start_date)
    )
    return result.scalars().all()

async def create_calendar_event(db: AsyncSession, obj_in: dict) -> CalendarEvent:
    event = CalendarEvent(**obj_in)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

async def delete_calendar_event(db: AsyncSession, school_id: UUID, event_id: UUID) -> bool:
    result = await db.execute(
        select(CalendarEvent).where(and_(CalendarEvent.id == event_id, CalendarEvent.school_id == school_id))
    )
    ev = result.scalar_one_or_none()
    if not ev:
        return False
    await db.delete(ev)
    await db.commit()
    return True
