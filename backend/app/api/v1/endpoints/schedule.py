from typing import List, Optional
from uuid import UUID
from datetime import time as time_type
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.crud import new_modules as crud
from app.schemas.new_modules import ScheduleSlotCreate, ScheduleSlotResponse

router = APIRouter()

DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]

PERIOD_TIMES = {
    1: ("07:30", "08:15"), 2: ("08:15", "09:00"), 3: ("09:00", "09:45"),
    4: ("09:45", "10:30"), 5: ("10:45", "11:30"), 6: ("11:30", "12:15"),
    7: ("12:15", "13:00"), 8: ("13:00", "13:45"),
}

@router.get("/", response_model=List[dict])
async def get_schedule(
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    return await crud.get_school_schedule(db, UUID(school_id))

@router.post("/", response_model=dict, status_code=201)
async def add_slot(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
    body: dict,
):
    period = int(body.get("period", 1))
    times = PERIOD_TIMES.get(period, ("07:30", "08:15"))
    obj = {
        "school_id":  UUID(school_id),
        "class_id":   UUID(str(body["class_id"])),
        "teacher_id": UUID(str(body["teacher_id"])),
        "day_of_week": body["day_of_week"],
        "period":      period,
        "start_time":  time_type.fromisoformat(body.get("start_time", times[0])),
        "end_time":    time_type.fromisoformat(body.get("end_time", times[1])),
        "room":        body.get("room"),
    }
    slot = await crud.create_schedule_slot(db, obj)
    return {"id": str(slot.id), "message": "Slot created"}

@router.delete("/{slot_id}", status_code=204)
async def remove_slot(
    slot_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
):
    ok = await crud.delete_schedule_slot(db, UUID(school_id), slot_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Slot not found")
