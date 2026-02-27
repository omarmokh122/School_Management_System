from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
def read_current_user():
    """Get current user details."""
    return {"message": "User profile endpoint"}
