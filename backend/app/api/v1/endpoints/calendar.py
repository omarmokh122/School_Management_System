from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.crud import new_modules as crud

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_events(
    year:  int,
    month: int,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    events = await crud.get_calendar_events(db, UUID(school_id), year, month)
    return [
        {
            "id":          str(e.id),
            "title":       e.title,
            "description": e.description,
            "event_type":  e.event_type,
            "start_date":  str(e.start_date),
            "end_date":    str(e.end_date),
            "class_id":    str(e.class_id) if e.class_id else None,
        }
        for e in events
    ]

@router.post("/", response_model=dict, status_code=201)
async def create_event(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
    body: dict,
):
    obj = {
        "school_id":   UUID(school_id),
        "title":       body["title"],
        "description": body.get("description"),
        "event_type":  body.get("event_type", "activity"),
        "start_date":  body["start_date"],
        "end_date":    body.get("end_date", body["start_date"]),
        "class_id":    UUID(str(body["class_id"])) if body.get("class_id") else None,
    }
    event = await crud.create_calendar_event(db, obj)
    return {"id": str(event.id), "message": "Event created"}

@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
):
    ok = await crud.delete_calendar_event(db, UUID(school_id), event_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Event not found")
