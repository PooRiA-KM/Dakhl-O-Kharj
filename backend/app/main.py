from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401
from app.api.v1 import (
    accounts,
    auth,
    categories,
    health,
    transactions,
    users,
)
from app.config import get_settings
from app.database import Base, engine

settings = get_settings()

# برای شروع سریع پروژه، جدول‌ها به صورت خودکار ساخته می‌شوند.
# بعداً بهتر است به جای این کار از Alembic و migration استفاده کنیم.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="0.2.0",
    description="API پروژه مدیریت دخل و خرج - Dakhl-O-Kharj",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
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
    health.router,
    prefix=api_prefix,
    tags=["Health"],
)


@app.get("/")
def root():
    return {
        "app": "Dakhl-O-Kharj API",
        "docs": "/docs",
        "health": f"{api_prefix}/health",
    }