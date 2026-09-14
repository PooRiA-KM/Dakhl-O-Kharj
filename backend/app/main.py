from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401
from app.api.v1 import (
    accounts,
    admin,
    auth,
    categories,
    dashboard,
    health,
    reports,
    transactions,
    users,
)
from app.config import get_settings
from app.database import Base, engine
from sqlalchemy import text

settings = get_settings()

# برای شروع سریع پروژه، جدول‌ها به صورت خودکار ساخته می‌شوند.
Base.metadata.create_all(bind=engine)

with engine.begin() as conn:
    conn.execute(
        text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin "
            "BOOLEAN NOT NULL DEFAULT false"
        )
    )

app = FastAPI(
    title=settings.app_name,
    version="0.3.0",
    description="API پروژه مدیریت دخل و خرج - Dakhl-O-Kharj",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api/v1"

app.include_router(
    auth.router,
    prefix=f"{api_prefix}/auth",
    tags=["Auth"],
)

app.include_router(
    users.router,
    prefix=f"{api_prefix}/users",
    tags=["Users"],
)

app.include_router(
    categories.router,
    prefix=f"{api_prefix}/categories",
    tags=["Categories"],
)

app.include_router(
    accounts.router,
    prefix=f"{api_prefix}/accounts",
    tags=["Accounts"],
)

app.include_router(
    transactions.router,
    prefix=f"{api_prefix}/transactions",
    tags=["Transactions"],
)

app.include_router(
    dashboard.router,
    prefix=f"{api_prefix}/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    reports.router,
    prefix=f"{api_prefix}/reports",
    tags=["Reports"],
)

app.include_router(
    health.router,
    prefix=api_prefix,
    tags=["Health"],
)

app.include_router(
    admin.router,
    prefix=f"{api_prefix}/admin",
    tags=["Admin"],
)


@app.get("/")
def root():
    return {
        "app": "Dakhl-O-Kharj API",
        "version": "0.3.0",
        "docs": "/docs",
        "health": f"{api_prefix}/health",
    }