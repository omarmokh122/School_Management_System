from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.student import Student
from app.models.teacher import Teacher
from app.models.finance import FinancialRecord
from app.schemas.report import DashboardStats

class CRUDReport:
    async def get_dashboard_stats(self, db: AsyncSession, school_id: UUID) -> DashboardStats:
        # Count students
        students_query = await db.execute(
            select(func.count(Student.id)).filter(Student.school_id == school_id)
        )
        total_students = students_query.scalar() or 0

        # Count teachers
        teachers_query = await db.execute(
            select(func.count(Teacher.id)).filter(Teacher.school_id == school_id)
        )
        total_teachers = teachers_query.scalar() or 0

        # Financial Data
        finance_query = await db.execute(
            select(
                func.sum(FinancialRecord.amount).label("total_expected"),
                func.sum(FinancialRecord.amount).filter(FinancialRecord.status == "paid").label("total_collected"),
                func.count(FinancialRecord.id).filter(FinancialRecord.status != "paid").label("outstanding_count")
            ).filter(
                FinancialRecord.school_id == school_id,
                FinancialRecord.type == "invoice"
            )
        )
        fin_stats = finance_query.first()

        total_expected = float(fin_stats.total_expected or 0.0)
        total_collected = float(fin_stats.total_collected or 0.0)
        outstanding_count = fin_stats.outstanding_count or 0

        return DashboardStats(
            total_students=total_students,
            total_teachers=total_teachers,
            total_revenue_expected=total_expected,
            total_revenue_collected=total_collected,
            outstanding_invoices_count=outstanding_count
        )

report = CRUDReport()
