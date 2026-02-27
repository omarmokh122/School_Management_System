from pydantic import BaseModel
from typing import List

class DashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    total_revenue_expected: float
    total_revenue_collected: float
    outstanding_invoices_count: int
