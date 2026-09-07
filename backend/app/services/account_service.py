from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account import AccountCreate, AccountUpdate


def get_account_by_id_for_user(
    db: Session,
    account_id: int,
    user_id: int,
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
            detail="حساب یافت نشد.",
        )

    return account


def get_accounts(db: Session, user_id: int) -> list[Account]:
    return (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .order_by(Account.is_default.desc(), Account.created_at.asc())
        .all()
    )


def create_account(
    db: Session,
    user_id: int,
    payload: AccountCreate,
) -> Account:
    # اگر این حساب پیش‌فرض است، حساب‌های پیش‌فرض قبلی را از حالت پیش‌فرض خارج کن
    if payload.is_default:
        db.query(Account).filter(
            Account.user_id == user_id,
            Account.is_default == True,  # noqa: E712
        ).update(
            {Account.is_default: False},
            synchronize_session=False,
        )

    account = Account(
        user_id=user_id,
        name=payload.name,
        type=payload.type.value,
        initial_balance=payload.initial_balance,
        is_default=payload.is_default,
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account


def update_account(
    db: Session,
    user_id: int,
    account_id: int,
    payload: AccountUpdate,
) -> Account:
    account = get_account_by_id_for_user(
        db=db,
        account_id=account_id,
        user_id=user_id,
    )

    update_data = payload.model_dump(exclude_unset=True)

    if "type" in update_data and update_data["type"] is not None:
        new_type = update_data["type"]
        if hasattr(new_type, "value"):
            update_data["type"] = new_type.value
        else:
            update_data["type"] = str(new_type)

    # اگر کاربر می‌خواهد این حساب را پیش‌فرض کند، بقیه را از پیش‌فرض خارج کن
    if update_data.get("is_default") is True and not account.is_default:
        db.query(Account).filter(
            Account.user_id == user_id,
            Account.id != account.id,
            Account.is_default == True,  # noqa: E712
        ).update(
            {Account.is_default: False},
            synchronize_session=False,
        )

    # جلوگیری از غیرفعال کردن آخرین حساب پیش‌فرض
    if update_data.get("is_default") is False and account.is_default:
        other_default_count = (
            db.query(Account)
            .filter(
                Account.user_id == user_id,
                Account.id != account.id,
                Account.is_default == True,  # noqa: E712
            )
            .count()
        )

        if other_default_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="حداقل یک حساب باید به‌عنوان پیش‌فرض باقی بماند.",
            )

    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)

    return account


def delete_account(
    db: Session,
    user_id: int,
    account_id: int,
) -> None:
    account = get_account_by_id_for_user(
        db=db,
        account_id=account_id,
        user_id=user_id,
    )

    # جلوگیری از حذف آخرین حساب کاربر
    total_accounts_count = (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .count()
    )

    if total_accounts_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حداقل یک حساب باید برای کاربر باقی بماند.",
        )

    # اگر حساب پیش‌فرض در حال حذف است، یک حساب دیگر را پیش‌فرض کن
    if account.is_default:
        another_account = (
            db.query(Account)
            .filter(
                Account.user_id == user_id,
                Account.id != account.id,
            )
            .first()
        )

        if another_account is not None:
            another_account.is_default = True

    # قطع اتصال تراکنش‌ها از این حساب
    db.query(Transaction).filter(
        Transaction.account_id == account_id,
        Transaction.user_id == user_id,
    ).update(
        {Transaction.account_id: None},
        synchronize_session=False,
    )

    db.delete(account)
    db.commit()