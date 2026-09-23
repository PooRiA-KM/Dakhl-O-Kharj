from datetime import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.dashboard import (
    CategoryChartItem,
    CategoryChartResponse,
    MonthlyChartResponse,
    MonthlyDataPoint,
    RecentTransactionRead,
    RecentTransactionsResponse,
    SummaryResponse,
)
from app.utils.persian_date import (
    current_jalali_month_range,
    jalali_month_range,
    last_n_jalali_months,
    to_persian_full,
)

ZERO = Decimal("0")


def _sum_transactions(
    db: Session,
    user_id: int,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> tuple[Decimal, Decimal]:
    query = db.query(
        Transaction.type,
        func.sum(Transaction.amount).label("total"),
    ).filter(Transaction.user_id == user_id)

    if date_from:
        query = query.filter(Transaction.occurred_at >= date_from)
    if date_to:
        query = query.filter(Transaction.occurred_at < date_to)

    rows = query.group_by(Transaction.type).all()

    income = ZERO
    expense = ZERO

    for row in rows:
        amount = Decimal(str(row.total or 0))
        if row.type == "income":
            income += amount
        elif row.type == "expense":
            expense += amount

    return income, expense


def get_summary(db: Session, user_id: int) -> SummaryResponse:
    start, end = current_jalali_month_range()

    month_income, month_expense = _sum_transactions(
        db=db,
        user_id=user_id,
        date_from=start,
        date_to=end,
    )

    total_income, total_expense = _sum_transactions(
        db=db,
        user_id=user_id,
    )

    initial_sum = (
        db.query(func.sum(Account.initial_balance))
        .filter(Account.user_id == user_id)
        .scalar()
        or ZERO
    )
    initial_sum = Decimal(str(initial_sum))

    return SummaryResponse(
        income_this_month=month_income,
        expense_this_month=month_expense,
        balance_this_month=month_income - month_expense,
        total_income=total_income,
        total_expense=total_expense,
        total_balance=total_income - total_expense + initial_sum,
        current_month_start=start,
        current_month_end=end,
        current_month_label=last_n_jalali_months(1)[0]["label"],
    )


def get_recent_transactions(
    db: Session,
    user_id: int,
    limit: int = 10,
) -> RecentTransactionsResponse:
    transactions = (
        db.query(Transaction)
        .options(
            joinedload(Transaction.category),
            joinedload(Transaction.account),
        )
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
        .limit(limit)
        .all()
    )

    total = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.user_id == user_id)
        .scalar()
        or 0
    )

    items = []
    for t in transactions:
        items.append(
            RecentTransactionRead.model_validate(
                {
                    "id": t.id,
                    "title": t.title,
                    "amount": t.amount,
                    "type": t.type,
                    "occurred_at": t.occurred_at,
                    "occurred_at_persian": to_persian_full(t.occurred_at),
                    "category": t.category,
                    "account": t.account,
                }
            )
        )

    return RecentTransactionsResponse(items=items, total=total)


def get_monthly_chart(
    db: Session,
    user_id: int,
    months: int = 12,
) -> MonthlyChartResponse:
    points = []

    for m in last_n_jalali_months(months):
        start, end = jalali_month_range(m["year"], m["month"])
        income, expense = _sum_transactions(
            db=db,
            user_id=user_id,
            date_from=start,
            date_to=end,
        )

        points.append(
            MonthlyDataPoint(
                year=m["year"],
                month=m["month"],
                label=m["label"],
                income=income,
                expense=expense,
                balance=income - expense,
            )
        )

    points.reverse()
    return MonthlyChartResponse(points=points)


def get_category_chart(
    db: Session,
    user_id: int,
) -> CategoryChartResponse:
    start, end = current_jalali_month_range()

    transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.occurred_at >= start,
            Transaction.occurred_at < end,
        )
        .all()
    )

    totals: dict = {}
    total_expense = ZERO

    for t in transactions:
        amount = Decimal(str(t.amount))
        total_expense += amount

        if t.category_id:
            key = t.category_id
            if key not in totals:
                totals[key] = {
                    "category_id": t.category_id,
                    "category_name": t.category.name if t.category else "نامشخص",
                    "color": t.category.color if t.category else None,
                    "amount": ZERO,
                    "count": 0,
                }
        else:
            key = "uncategorized"
            if key not in totals:
                totals[key] = {
                    "category_id": None,
                    "category_name": "بدون دسته‌بندی",
                    "color": "#9ca3af",
                    "amount": ZERO,
                    "count": 0,
                }

        totals[key]["amount"] += amount
        totals[key]["count"] += 1

    items = []
    for data in totals.values():
        percentage = (
            float(data["amount"] / total_expense * 100)
            if total_expense > 0
            else 0.0
        )
        items.append(
            CategoryChartItem(
                category_id=data["category_id"],
                category_name=data["category_name"],
                color=data["color"],
                amount=data["amount"],
                percentage=round(percentage, 2),
                count=data["count"],
            )
        )

    items.sort(key=lambda x: x.amount, reverse=True)

    return CategoryChartResponse(
        month_label=last_n_jalali_months(1)[0]["label"],
        total_expense=total_expense,
        items=items,
    )