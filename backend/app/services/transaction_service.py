from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionType,
    TransactionUpdate,
)


def get_transaction_by_id_for_user(
    db: Session,
    transaction_id: int,
    user_id: int,
) -> Transaction:
    transaction = (
        db.query(Transaction)
        .options(
            joinedload(Transaction.category),
            joinedload(Transaction.account),
        )
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id,
        )
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="تراکنش یافت نشد.",
        )

    return transaction


def _validate_category(
    db: Session,
    user_id: int,
    category_id: int,
    transaction_type_value: str,
) -> Category:
    category = (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.user_id == user_id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="دسته‌بندی یافت نشد.",
        )

    if category.type not in ("both", transaction_type_value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="دسته‌بندی انتخاب‌شده با نوع تراکنش سازگار نیست.",
        )

    return category


def _validate_account(
    db: Session,
    user_id: int,
    account_id: int,
) -> Account:
    account = (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == user_id,
        )
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="حساب انتخاب‌شده یافت نشد.",
        )

    return account


def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    transaction_type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    account_id: Optional[int] = None,
    search: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> list[Transaction]:
    query = (
        db.query(Transaction)
        .options(
            joinedload(Transaction.category),
            joinedload(Transaction.account),
        )
        .filter(Transaction.user_id == user_id)
    )

    if transaction_type:
        query = query.filter(Transaction.type == transaction_type.value)

    if category_id:
        query = query.filter(Transaction.category_id == category_id)

    if account_id:
        query = query.filter(Transaction.account_id == account_id)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.title.ilike(pattern),
                Transaction.description.ilike(pattern),
            )
        )

    if date_from:
        query = query.filter(Transaction.occurred_at >= date_from)

    if date_to:
        query = query.filter(Transaction.occurred_at <= date_to)

    return (
        query
        .order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_transaction(
    db: Session,
    user_id: int,
    payload: TransactionCreate,
) -> Transaction:
    if payload.category_id is not None:
        _validate_category(
            db=db,
            user_id=user_id,
            category_id=payload.category_id,
            transaction_type_value=payload.type.value,
        )

    if payload.account_id is not None:
        _validate_account(
            db=db,
            user_id=user_id,
            account_id=payload.account_id,
        )

    transaction = Transaction(
        user_id=user_id,
        title=payload.title,
        amount=payload.amount,
        type=payload.type.value,
        category_id=payload.category_id,
        account_id=payload.account_id,
        occurred_at=payload.occurred_at or datetime.now(timezone.utc),
        description=payload.description,
    )

    db.add(transaction)
    db.commit()

    return get_transaction_by_id_for_user(
        db=db,
        transaction_id=transaction.id,
        user_id=user_id,
    )


def update_transaction(
    db: Session,
    user_id: int,
    transaction_id: int,
    payload: TransactionUpdate,
) -> Transaction:
    transaction = get_transaction_by_id_for_user(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    update_data = payload.model_dump(exclude_unset=True)

    if "type" in update_data and update_data["type"] is not None:
        new_type = update_data["type"]

        if isinstance(new_type, TransactionType):
            update_data["type"] = new_type.value
        else:
            update_data["type"] = str(new_type)

    current_type_value = update_data.get("type", transaction.type)

    new_category_id = update_data.get("category_id", transaction.category_id)
    new_account_id = update_data.get("account_id", transaction.account_id)

    if new_category_id is not None:
        _validate_category(
            db=db,
            user_id=user_id,
            category_id=new_category_id,
            transaction_type_value=current_type_value,
        )

    if new_account_id is not None:
        _validate_account(
            db=db,
            user_id=user_id,
            account_id=new_account_id,
        )

    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()

    return get_transaction_by_id_for_user(
        db=db,
        transaction_id=transaction.id,
        user_id=user_id,
    )


def delete_transaction(
    db: Session,
    user_id: int,
    transaction_id: int,
) -> None:
    transaction = get_transaction_by_id_for_user(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    db.delete(transaction)
    db.commit()