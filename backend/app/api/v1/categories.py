from typing import Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryRead,
    CategoryType,
    CategoryUpdate,
)
from app.services import category_service

router = APIRouter()


@router.get("", response_model=list[CategoryRead])
def list_categories(
    category_type: Optional[CategoryType] = Query(default=None, alias="type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return category_service.get_categories(
        db=db,
        user_id=current_user.id,
        category_type=category_type.value if category_type else None,
    )


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return category_service.create_category(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return category_service.get_category_by_id_for_user(
        db=db,
        category_id=category_id,
        user_id=current_user.id,
    )


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return category_service.update_category(
        db=db,
        user_id=current_user.id,
        category_id=category_id,
        payload=payload,
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category_service.delete_category(
        db=db,
        user_id=current_user.id,
        category_id=category_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)