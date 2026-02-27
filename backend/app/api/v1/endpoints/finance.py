from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.schemas.finance import FinancialRecordCreate, FinancialRecordUpdate, FinancialRecordResponse
from app.crud import finance as crud_finance

router = APIRouter()

@router.get("/", response_model=List[FinancialRecordResponse])
async def read_records(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Accountant"]))
):
    """
    Retrieve all financial records for the current tenant's school.
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID format")
    
    records = await crud_finance.financial_record.get_multi(db, school_id=tenant_uuid, skip=skip, limit=limit)
    return records

@router.get("/student/{student_id}", response_model=List[FinancialRecordResponse])
async def read_student_records(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Accountant"]))
):
    """
    Retrieve all financial records for a specific student.
    """
    tenant_uuid = UUID(school_id)
    records = await crud_finance.financial_record.get_by_student(db, school_id=tenant_uuid, student_id=student_id)
    return records

@router.post("/", response_model=FinancialRecordResponse)
async def create_record(
    *,
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    record_in: FinancialRecordCreate,
    _ = Depends(dependencies.require_role(["Admin", "Accountant"]))
):
    """
    Create a new financial record (Admin or Accountant only).
    """
    tenant_uuid = UUID(school_id)
    if record_in.school_id != tenant_uuid:
        raise HTTPException(status_code=403, detail="Cannot create record for different school")
        
    record_created = await crud_finance.financial_record.create(db, obj_in=record_in)
    return record_created

@router.put("/{record_id}", response_model=FinancialRecordResponse)
async def update_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: UUID,
    record_in: FinancialRecordUpdate,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "Accountant"]))
):
    """
    Update a financial record.
    """
    tenant_uuid = UUID(school_id)
    record = await crud_finance.financial_record.get_by_id(db, school_id=tenant_uuid, record_id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    record_updated = await crud_finance.financial_record.update(
        db, school_id=tenant_uuid, db_obj=record, obj_in=record_in
    )
    return record_updated
