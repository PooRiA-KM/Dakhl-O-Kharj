from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.account import AccountRead
from app.services import account_service

router = APIRouter()


@router.get("", response_model=list[AccountRead])
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.get_accounts(
        db=db,
        user_id=current_user.id,
    )