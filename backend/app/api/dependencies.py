from typing import Optional
import jwt
import base64
import logging
import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Simple in-memory JWKS cache (keyed by kid)
_jwks_cache: dict = {}

def _get_jwks_key(kid: str):
    """Fetch EC or RSA public key from Supabase JWKS endpoint, cached by kid."""
    global _jwks_cache
    if kid in _jwks_cache:
        return _jwks_cache[kid]
    try:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        resp = httpx.get(jwks_url, timeout=5.0)
        resp.raise_for_status()
        keys = resp.json().get("keys", [])
        for key_data in keys:
            key_id = key_data.get("kid", "")
            kty = key_data.get("kty", "RSA")
            if kty == "EC":
                public_key = jwt.algorithms.ECAlgorithm.from_jwk(key_data)
            else:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key_data)
            _jwks_cache[key_id] = public_key
            logger.info("Cached JWKS key: kid=%s kty=%s alg=%s", key_id, kty, key_data.get("alg"))
        return _jwks_cache.get(kid)
    except Exception as e:
        logger.error("Failed to fetch JWKS from Supabase: %s", e)
        return None


def _decode_token(token: str) -> dict:
    """
    Decode a Supabase JWT.
    - Peeks at the header to detect the algorithm (HS256 or RS256).
    - HS256: verifies with SUPABASE_JWT_SECRET.
    - RS256/RS384/RS512: fetches the public key from Supabase JWKS endpoint.
    """
    decode_opts = {"verify_aud": False}

    try:
        header = jwt.get_unverified_header(token)
    except Exception as e:
        raise jwt.InvalidTokenError(f"Cannot read token header: {e}")

    alg = header.get("alg", "HS256")
    logger.debug("JWT algorithm from header: %s", alg)

    if alg in ("HS256", "HS384", "HS512"):
        # --- Symmetric: use JWT secret ---
        secret = settings.SUPABASE_JWT_SECRET
        errors = []
        # Try raw secret
        try:
            return jwt.decode(token, secret, algorithms=[alg], options=decode_opts)
        except jwt.ExpiredSignatureError:
            raise
        except jwt.InvalidTokenError as e:
            errors.append(f"raw: {e}")
        # Try base64url-decoded secret
        try:
            decoded_secret = base64.urlsafe_b64decode(secret + "==")
            return jwt.decode(token, decoded_secret, algorithms=[alg], options=decode_opts)
        except jwt.ExpiredSignatureError:
            raise
        except Exception as e:
            errors.append(f"b64: {e}")
        raise jwt.InvalidTokenError(f"HS decode failed: {'; '.join(errors)}")

    elif alg in ("RS256", "RS384", "RS512", "ES256", "ES384", "ES512"):
        # --- Asymmetric: use EC or RSA public key from Supabase JWKS ---
        kid = header.get("kid", "")
        public_key = _get_jwks_key(kid)
        if not public_key:
            raise jwt.InvalidTokenError(
                f"Could not find public key for kid='{kid}' from Supabase JWKS. "
                "Check that SUPABASE_URL is correct in backend/.env"
            )
        return jwt.decode(token, public_key, algorithms=[alg], options=decode_opts)

    else:
        raise jwt.InvalidTokenError(f"Unsupported JWT algorithm: {alg}")



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
