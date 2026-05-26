from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.app_errors import AppError
from app.auth.router import router as auth_router
from app.appointments.router import router as appointments_router
from app.db.database import init_db
from app.intake.router import router as intake_router
from app.organizations.router import router as organizations_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="ACL Injury Rehab API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, error: AppError) -> JSONResponse:
        return JSONResponse(status_code=error.status_code, content={"detail": error.message})

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(organizations_router)
    app.include_router(intake_router)
    app.include_router(appointments_router)

    return app
