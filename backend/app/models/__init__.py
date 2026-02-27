from .base import Base
from .school import School
from .user import User
from .student import Student
from .teacher import Teacher
from .finance import FinancialRecord
from .academic import Class, ClassEnrollment, Curriculum, Assessment, Grade

# Ensure all models are imported before Alembic reads Base.metadata
