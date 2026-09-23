from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.admin import (
    AdminStatsResponse,
    AdminTransactionListResponse,
    AdminTransactionRead,
    AdminTransactionUser,
    AdminUserListResponse,
    AdminUserRead,
    AdminUserUpdate,
    RegistrationPoint,
)
from app.utils.persian_date import (
    current_jalali_month_range,
    jalali_month_range,
    last_n_jalali_months,
    now_tehran,
)

ZERO = Decimal("0")


def _aggregates_subquery(db: Session):
    return (
        db.query(
            Transaction.user_id.label("user_id"),
            func.count(Transaction.id).label("tx_count"),
            func.sum(
                case(
                    (Transaction.type == "income", Transaction.amount),
                    else_=0,
                )
            ).label("total_income"),
            func.sum(
                case(
                    (Transaction.type == "expense", Transaction.amount),
                    else_=0,
                )
            ).label("total_expense"),
            func.max(Transaction.occurred_at).label("last_transaction_at"),
        )
        .group_by(Transaction.user_id)
        .subquery()
    )


def _build_admin_user(user: User, agg) -> AdminUserRead:
    return AdminUserRead(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        is_active=user.is_active,
        is_admin=user.is_admin,
        created_at=user.created_at,
        transaction_count=int(agg.tx_count or 0) if agg else 0,
        total_income=Decimal(str(agg.total_income or 0)) if agg else ZERO,
        total_expense=Decimal(str(agg.total_expense or 0)) if agg else ZERO,
        last_transaction_at=agg.last_transaction_at if agg else None,
    )


def get_users(
    db: Session,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> AdminUserListResponse:
    sub = _aggregates_subquery(db)

    query = db.query(
        User,
        sub.c.tx_count,
        sub.c.total_income,
        sub.c.total_expense,
        sub.c.last_transaction_at,
    ).outerjoin(sub, User.id == sub.c.user_id)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
            )
        )

    total = query.count()

    rows = (
        query.order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = [_build_admin_user(row[0], row) for row in rows]

    return AdminUserListResponse(items=items, total=total)


def get_user(
    db: Session,
    user_id: int,
) -> AdminUserRead:
    sub = _aggregates_subquery(db)

    row = (
        db.query(
            User,
            sub.c.tx_count,
            sub.c.total_income,
            sub.c.total_expense,
            sub.c.last_transaction_at,
        )
        .outerjoin(sub, User.id == sub.c.user_id)
        .filter(User.id == user_id)
        .first()
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد.",
        )

    return _build_admin_user(row[0], row)


def get_stats(db: Session) -> AdminStatsResponse:
    now = now_tehran()
    month_start = current_jalali_month_range()[0]

    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active == True)  # noqa: E712
        .scalar()
        or 0
    )
    admin_users = (
        db.query(func.count(User.id))
        .filter(User.is_admin == True)  # noqa: E712
        .scalar()
        or 0
    )
    new_users_this_month = (
        db.query(func.count(User.id))
        .filter(User.created_at >= month_start)
        .scalar()
        or 0
    )
    total_transactions = db.query(func.count(Transaction.id)).scalar() or 0

    sums = (
        db.query(
            func.sum(
                case(
                    (Transaction.type == "income", Transaction.amount),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (Transaction.type == "expense", Transaction.amount),
                    else_=0,
                )
            ),
        )
        .first()
    )

    total_income = Decimal(str(sums[0] or 0))
    total_expense = Decimal(str(sums[1] or 0))

    registrations = []
    for m in last_n_jalali_months(12):
        start, end = jalali_month_range(m["year"], m["month"])
        count = (
                db.query(func.count(User.id))
                .filter(User.created_at >= start, User.created_at < end)
                .scalar()
                or 0
        )
        registrations.append(
            RegistrationPoint(
                year=m["year"],
                month=m["month"],
                label=m["label"],
                count=count,
            )
        )

    registrations.reverse()

    recent_users = get_users(db=db, skip=0, limit=5).items

    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        admin_users=admin_users,
        new_users_this_month=new_users_this_month,
        total_transactions=total_transactions,
        total_income=total_income,
        total_expense=total_expense,
        registrations=registrations,
        recent_users=recent_users,
    )


def get_transactions(
    db: Session,
    search: str | None = None,
    tx_type: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> AdminTransactionListResponse:
    query = (
        db.query(Transaction)
        .options(
            joinedload(Transaction.user),
            joinedload(Transaction.category),
            joinedload(Transaction.account),
        )
        .join(Transaction.user)
    )

    if tx_type:
        query = query.filter(Transaction.type == tx_type)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.title.ilike(pattern),
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
            )
        )

    total = query.count()

    rows = (
        query.order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = [
        AdminTransactionRead(
            id=t.id,
            title=t.title,
            amount=t.amount,
            type=t.type,
            occurred_at=t.occurred_at,
            description=t.description,
            category_name=t.category.name if t.category else None,
            account_name=t.account.name if t.account else None,
            user=AdminTransactionUser(
                id=t.user.id,
                full_name=t.user.full_name,
                email=t.user.email,
            ),
        )
        for t in rows
    ]

    return AdminTransactionListResponse(items=items, total=total)


def update_user(
    db: Session,
    admin_id: int,
    user_id: int,
    payload: AdminUserUpdate,
) -> AdminUserRead:
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد.",
        )

    if user.id == admin_id and (
        payload.is_active is False or payload.is_admin is False
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نمی‌توانید وضعیت یا نقش حساب خودتان را تغییر دهید.",
        )

    if payload.is_active is not None:
        user.is_active = payload.is_active

    if payload.is_admin is not None:
        user.is_admin = payload.is_admin

    db.commit()
    db.refresh(user)

    return get_user(db=db, user_id=user.id)


def delete_user(db: Session, admin_id: int, user_id: int) -> None:
    if user_id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نمی‌توانید حساب خودتان را حذف کنید.",
        )

    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر یافت نشد.",
        )

    db.delete(user)
    db.commit()