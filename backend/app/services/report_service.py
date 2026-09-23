from datetime import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.report import (
    AccountReportItem,
    AccountReportResponse,
    CategoryReportItem,
    CategoryReportResponse,
    MonthlyReportItem,
    MonthlyReportResponse,
)
from app.utils.persian_date import (
    current_jalali_month_range,
    jalali_month_range,
    last_n_jalali_months,
)

ZERO = Decimal("0")


def _sum_by_type(
    db: Session,
    user_id: int,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    category_id: int | None = None,
    account_id: int | None = None,
) -> tuple[Decimal, Decimal, int]:
    query = db.query(
        Transaction.type,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count"),
    ).filter(Transaction.user_id == user_id)

    if date_from:
        query = query.filter(Transaction.occurred_at >= date_from)
    if date_to:
        query = query.filter(Transaction.occurred_at < date_to)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)

    rows = query.group_by(Transaction.type).all()

    income = ZERO
    expense = ZERO
    count = 0

    for row in rows:
        amount = Decimal(str(row.total or 0))
        if row.type == "income":
            income += amount
        elif row.type == "expense":
            expense += amount
        count += row.count or 0

    return income, expense, count


def get_monthly_report(
    db: Session,
    user_id: int,
    months: int = 12,
) -> MonthlyReportResponse:
    items = []
    total_income = ZERO
    total_expense = ZERO
    total_transactions = 0

    for m in last_n_jalali_months(months):
        start, end = jalali_month_range(m["year"], m["month"])
        income, expense, count = _sum_by_type(
            db=db,
            user_id=user_id,
            date_from=start,
            date_to=end,
        )

        items.append(
            MonthlyReportItem(
                year=m["year"],
                month=m["month"],
                label=m["label"],
                income=income,
                expense=expense,
                balance=income - expense,
                transaction_count=count,
            )
        )

        total_income += income
        total_expense += expense
        total_transactions += count

    items.reverse()

    return MonthlyReportResponse(
        months=items,
        total_income=total_income,
        total_expense=total_expense,
        total_balance=total_income - total_expense,
        total_transactions=total_transactions,
    )


def get_category_report(
    db: Session,
    user_id: int,
) -> CategoryReportResponse:
    start, end = current_jalali_month_range()

    categories = (
        db.query(Category)
        .filter(Category.user_id == user_id)
        .all()
    )

    income_items: list[CategoryReportItem] = []
    expense_items: list[CategoryReportItem] = []
    total_income = ZERO
    total_expense = ZERO

    for cat in categories:
        income, expense, count = _sum_by_type(
            db=db,
            user_id=user_id,
            date_from=start,
            date_to=end,
            category_id=cat.id,
        )

        if income > 0:
            income_items.append(
                CategoryReportItem(
                    category_id=cat.id,
                    category_name=cat.name,
                    type=cat.type,
                    color=cat.color,
                    amount=income,
                    count=count,
                    percentage=0.0,
                )
            )
            total_income += income

        if expense > 0:
            expense_items.append(
                CategoryReportItem(
                    category_id=cat.id,
                    category_name=cat.name,
                    type=cat.type,
                    color=cat.color,
                    amount=expense,
                    count=count,
                    percentage=0.0,
                )
            )
            total_expense += expense

    # تراکنش‌های بدون دسته‌بندی
    all_income, all_expense, _ = _sum_by_type(
        db=db,
        user_id=user_id,
        date_from=start,
        date_to=end,
    )

    uncategorized_income = all_income - total_income
    uncategorized_expense = all_expense - total_expense

    if uncategorized_income > 0:
        income_items.append(
            CategoryReportItem(
                category_id=None,
                category_name="بدون دسته‌بندی",
                type="income",
                color="#9ca3af",
                amount=uncategorized_income,
                count=0,
                percentage=0.0,
            )
        )
        total_income = all_income

    if uncategorized_expense > 0:
        expense_items.append(
            CategoryReportItem(
                category_id=None,
                category_name="بدون دسته‌بندی",
                type="expense",
                color="#9ca3af",
                amount=uncategorized_expense,
                count=0,
                percentage=0.0,
            )
        )
        total_expense = all_expense

    for item in income_items:
        item.percentage = (
            round(float(item.amount / total_income * 100), 2)
            if total_income > 0
            else 0.0
        )

    for item in expense_items:
        item.percentage = (
            round(float(item.amount / total_expense * 100), 2)
            if total_expense > 0
            else 0.0
        )

    income_items.sort(key=lambda x: x.amount, reverse=True)
    expense_items.sort(key=lambda x: x.amount, reverse=True)

    return CategoryReportResponse(
        month_label=last_n_jalali_months(1)[0]["label"],
        total_income=total_income,
        total_expense=total_expense,
        income_items=income_items,
        expense_items=expense_items,
    )


def get_account_report(
    db: Session,
    user_id: int,
) -> AccountReportResponse:
    accounts = (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .order_by(Account.is_default.desc(), Account.created_at.asc())
        .all()
    )

    items = []
    total_balance = ZERO

    for acc in accounts:
        income, expense, count = _sum_by_type(
            db=db,
            user_id=user_id,
            account_id=acc.id,
        )

        initial = Decimal(str(acc.initial_balance or 0))
        current = initial + income - expense

        items.append(
            AccountReportItem(
                account_id=acc.id,
                account_name=acc.name,
                account_type=acc.type,
                initial_balance=initial,
                current_balance=current,
                total_income=income,
                total_expense=expense,
                transaction_count=count,
            )
        )

        total_balance += current

    return AccountReportResponse(
        items=items,
        total_balance=total_balance,
    )