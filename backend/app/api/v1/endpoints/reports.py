from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.schemas.report import DashboardStats
from app.crud.report import report as crud_report

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Accountant"]))
):
    """
    Retrieve aggregated dashboard statistics for the tenant school.
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")
    
    stats = await crud_report.get_dashboard_stats(db, school_id=tenant_uuid)
    return stats
