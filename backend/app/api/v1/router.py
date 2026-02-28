from fastapi import APIRouter
from app.api.v1.endpoints import auth, students, teachers, finance, reports, webhooks, academic, manager_ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks (n8n)"])
api_router.include_router(academic.router, prefix="/academic", tags=["academic"])
api_router.include_router(manager_ai.router, prefix="/ai", tags=["ai-manager"])
