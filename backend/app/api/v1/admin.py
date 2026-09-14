from typing import Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.schemas.admin import (
    AdminStatsResponse,
    AdminTransactionListResponse,
    AdminUserListResponse,
    AdminUserRead,
    AdminUserUpdate,
)
from app.services import admin_service

router = APIRouter()


@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return admin_service.get_stats(db=db)


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    search: Optional[str] = Query(default=None, max_length=200),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return admin_service.get_users(
        db=db,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/users/{user_id}", response_model=AdminUserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return admin_service.get_user(db=db, user_id=user_id)


@router.put("/users/{user_id}", response_model=AdminUserRead)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return admin_service.update_user(
        db=db,
        admin_id=admin.id,
        user_id=user_id,
        payload=payload,
    )


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    admin_service.delete_user(
        db=db,
        admin_id=admin.id,
        user_id=user_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/transactions", response_model=AdminTransactionListResponse)
def list_transactions(
    search: Optional[str] = Query(default=None, max_length=200),
    tx_type: Optional[str] = Query(default=None, alias="type"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return admin_service.get_transactions(
        db=db,
        search=search,
        tx_type=tx_type,
        skip=skip,
        limit=limit,
    )