from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionRead,
    TransactionType,
    TransactionUpdate,
)
from app.services import transaction_service

router = APIRouter()


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    transaction_type: Optional[TransactionType] = Query(default=None, alias="type"),
    category_id: Optional[int] = Query(default=None),
    account_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=200),
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.get_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        transaction_type=transaction_type,
        category_id=category_id,
        account_id=account_id,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )


@router.post(
    "",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.create_transaction(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.get_transaction_by_id_for_user(
        db=db,
        transaction_id=transaction_id,
        user_id=current_user.id,
    )


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.update_transaction(
        db=db,
        user_id=current_user.id,
        transaction_id=transaction_id,
        payload=payload,
    )


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_service.delete_transaction(
        db=db,
        user_id=current_user.id,
        transaction_id=transaction_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)