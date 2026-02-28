from typing import Optional
import jwt
import base64
import logging
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

def _decode_token(token: str) -> dict:
    """
    Try to decode the Supabase JWT with multiple secret variants.
    Supabase JWTs are signed with HS256. The JWT_SECRET in the Supabase dashboard 
    is the raw secret — but some older projects stored a base64url-encoded version.
    We try both to be resilient.
    """
    secret = settings.SUPABASE_JWT_SECRET
    decode_opts = {"verify_aud": False}
    errors = []

    # 1. Try raw secret (most common)
    try:
        return jwt.decode(token, secret, algorithms=["HS256"], options=decode_opts)
    except jwt.ExpiredSignatureError:
        raise  # re-raise immediately — no point trying other keys
    except jwt.InvalidTokenError as e:
        errors.append(f"raw secret: {e}")

    # 2. Try base64url-decoded secret (some Supabase instances)
    try:
        decoded_secret = base64.urlsafe_b64decode(secret + "==")
        return jwt.decode(token, decoded_secret, algorithms=["HS256"], options=decode_opts)
    except jwt.ExpiredSignatureError:
        raise
    except Exception as e:
        errors.append(f"base64 secret: {e}")

    logger.error("JWT decode failed with all strategies: %s", "; ".join(errors))
    raise jwt.InvalidTokenError(f"Could not validate token. Tried: {'; '.join(errors)}")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Supabase JWT token and extract user information.
    """
    token = credentials.credentials
    try:
        payload = _decode_token(token)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired — please log in again")
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT token: %s", str(e))
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token. Check that SUPABASE_JWT_SECRET in backend/.env matches "
                   f"the JWT Secret from Supabase Project Settings → API. Details: {str(e)}"
        )


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
    SuperAdmin is implicitly allowed for all restricted routes.
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_meta = current_user.get("user_metadata", {})
        role = user_meta.get("role", "Student") # Default fallback
        if role != "SuperAdmin" and role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return role_checker
