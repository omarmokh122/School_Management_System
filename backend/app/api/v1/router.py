from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, students, teachers, finance, reports,
    webhooks, academic, manager_ai, teacher_tools, admin_tools,
    schedule, attendance, announcements, calendar,
)

api_router = APIRouter()
api_router.include_router(auth.router,           prefix="/auth",          tags=["auth"])
api_router.include_router(students.router,       prefix="/students",      tags=["students"])
api_router.include_router(teachers.router,       prefix="/teachers",      tags=["teachers"])
api_router.include_router(finance.router,        prefix="/finance",       tags=["finance"])
api_router.include_router(reports.router,        prefix="/reports",       tags=["reports"])
api_router.include_router(webhooks.router,       prefix="/webhooks",      tags=["webhooks (n8n)"])
api_router.include_router(academic.router,       prefix="/academic",      tags=["academic"])
api_router.include_router(manager_ai.router,     prefix="/ai",            tags=["ai-manager"])
api_router.include_router(teacher_tools.router,  prefix="/ai",            tags=["ai-teacher"])
api_router.include_router(admin_tools.router,    prefix="/ai",            tags=["ai-admin"])
api_router.include_router(schedule.router,       prefix="/schedule",      tags=["schedule"])
api_router.include_router(attendance.router,     prefix="/attendance",    tags=["attendance"])
api_router.include_router(announcements.router,  prefix="/announcements", tags=["announcements"])
api_router.include_router(calendar.router,       prefix="/calendar",      tags=["calendar"])

