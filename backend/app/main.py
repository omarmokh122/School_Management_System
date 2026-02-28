import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_checks():
    """Validate critical config values on startup."""
    jwt_secret = settings.SUPABASE_JWT_SECRET
    if not jwt_secret or jwt_secret in ("your-jwt-secret", ""):
        logger.error(
            "\n\n⛔  SUPABASE_JWT_SECRET is not set correctly in backend/.env!\n"
            "   All authenticated API calls will return 401 Invalid Token.\n"
            "   Fix: Go to Supabase Dashboard → Project Settings → API → JWT Secret\n"
            "   Copy the secret and paste it as SUPABASE_JWT_SECRET in backend/.env\n"
        )
    else:
        logger.info("✅ SUPABASE_JWT_SECRET is set (length: %d)", len(jwt_secret))

@app.get("/")
def root():
    return {"message": "Welcome to School Management SaaS API"}

