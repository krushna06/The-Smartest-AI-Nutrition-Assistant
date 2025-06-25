from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.v1.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.on_event("startup")
    async def startup_event():
        """Run on application startup."""
        logger.info("Starting up...")

    @app.on_event("shutdown")
    async def shutdown_event():
        """Run on application shutdown."""
        logger.info("Shutting down...")

    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "ok"}

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
