from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routers import professor, gigs, auth, applications, student

app = FastAPI(title=settings.app_name)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(professor.router, prefix="/api", tags=["professors"])
app.include_router(student.router, prefix="/api", tags=["students"])
app.include_router(gigs.router, prefix="/api", tags=["gigs"])
app.include_router(applications.router, prefix="/api", tags=["applications"])


@app.get("/")
def root():
    return {"message": "Research Gig Platform - Professor Module API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
