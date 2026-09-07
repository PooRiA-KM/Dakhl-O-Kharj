from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.category import CategoryRead
from app.services import category_service

router = APIRouter()


@router.get("", response_model=list[CategoryRead])
def list_categories(
    category_type: Optional[str] = Query(default=None, alias="type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return category_service.get_categories(
        db=db,
        user_id=current_user.id,
        category_type=category_type,
    )