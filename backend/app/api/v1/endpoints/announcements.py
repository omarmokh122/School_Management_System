from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.crud import new_modules as crud
from app.schemas.new_modules import AnnouncementCreate, AnnouncementResponse

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_announcements(
    audience: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
):
    anns = await crud.get_announcements(db, UUID(school_id), audience)
    return [
        {
            "id":         str(a.id),
            "title":      a.title,
            "body":       a.body,
            "audience":   a.audience,
            "priority":   a.priority,
            "expires_at": str(a.expires_at) if a.expires_at else None,
            "created_at": str(a.created_at),
        }
        for a in anns
    ]

@router.post("/", response_model=dict, status_code=201)
async def create_announcement(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
    body: dict,
):
    obj = {
        "school_id": UUID(school_id),
        "author_id": UUID(str(body["author_id"])) if body.get("author_id") else None,
        "title":     body["title"],
        "body":      body["body"],
        "audience":  body.get("audience", "all"),
        "priority":  body.get("priority", "normal"),
        "expires_at": body.get("expires_at"),
    }
    ann = await crud.create_announcement(db, obj)
    return {"id": str(ann.id), "message": "Announcement created"}

@router.delete("/{ann_id}", status_code=204)
async def delete_announcement(
    ann_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
):
    ok = await crud.delete_announcement(db, UUID(school_id), ann_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Announcement not found")
