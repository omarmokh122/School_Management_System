from typing import Optional
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Supabase JWT token and extract user information.
    """
    token = credentials.credentials
    try:
        # Supabase uses HS256 for signing their JWTs.
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_tenant(current_user: dict = Depends(get_current_user)) -> str:
    """
    Extract school_id from token to enforce multi-tenancy.
    """
    user_meta = current_user.get("user_metadata", {})
    school_id = user_meta.get("school_id")
    if not school_id:
        raise HTTPException(status_code=403, detail="User does not belong to any tenant/school.")
    return school_id

def require_role(allowed_roles: list[str]):
    """
    Dependency factory to check if the current user has one of the allowed roles.
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_meta = current_user.get("user_metadata", {})
        role = user_meta.get("role", "Student") # Default fallback
        if role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return role_checker
