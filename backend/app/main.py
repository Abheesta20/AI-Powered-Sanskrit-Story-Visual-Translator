"""
Ancient Text Translational Portal - Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routes import auth, upload, translation


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Ancient Text Translational Portal...")
    init_db()
    print("✅ Database initialized")
    yield
    print("👋 Shutting down...")


# ✅ CREATE APP ONLY ONCE
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    Ancient Text Translational Portal API
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# ✅ FIXED CORS (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",

        # ✅ ADD YOUR VERCEL FRONTEND HERE
        "https://ai-powered-sanskrit-story-visual-tr.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(translation.router)


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/api")
def api_info():
    return {
        "message": "Ancient Text Translational Portal API",
        "version": settings.APP_VERSION,
        "endpoints": {
            "auth": "/api/auth",
            "uploads": "/api/uploads",
            "translations": "/api/translations",
            "docs": "/api/docs"
        }
    }