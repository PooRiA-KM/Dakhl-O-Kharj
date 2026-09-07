from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.account import (
    AccountCreate,
    AccountRead,
    AccountUpdate,
)
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


@router.post(
    "",
    response_model=AccountRead,
    status_code=status.HTTP_201_CREATED,
)
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.create_account(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )


@router.get("/{account_id}", response_model=AccountRead)
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.get_account_by_id_for_user(
        db=db,
        account_id=account_id,
        user_id=current_user.id,
    )


@router.put("/{account_id}", response_model=AccountRead)
def update_account(
    account_id: int,
    payload: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.update_account(
        db=db,
        user_id=current_user.id,
        account_id=account_id,
        payload=payload,
    )


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account_service.delete_account(
        db=db,
        user_id=current_user.id,
        account_id=account_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)