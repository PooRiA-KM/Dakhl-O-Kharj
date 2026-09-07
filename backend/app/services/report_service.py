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
    current_month_start_end,
    gregorian_month_range,
    last_n_months,
    to_persian,
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
    month_list = last_n_months(months)
    items = []
    total_income = ZERO
    total_expense = ZERO
    total_transactions = 0

    for m in month_list:
        start, end = gregorian_month_range(m["year"], m["month"])
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
    start, end = current_month_start_end()

    # Get all categories of user
    categories = (
        db.query(Category)
        .filter(Category.user_id == user_id)
        .all()
    )

    income_items = []
    expense_items = []
    total_income = ZERO
    total_expense = ZERO

    # Process each category
    for cat in categories:
        income, expense, count = _sum_by_type(
            db=db,
            user_id=user_id,
            date_from=start,
            date_to=end,
            category_id=cat.id,
        )

        if income > 0 or (cat.type in ("income", "both")):
            income_items.append(
                CategoryReportItem(
                    category_id=cat.id,
                    category_name=cat.name,
                    type=cat.type,
                    color=cat.color,
                    amount=income,
                    count=count if cat.type != "expense" else 0,
                    percentage=0.0,  # will be calculated later
                )
            )
            total_income += income

        if expense > 0 or (cat.type in ("expense", "both")):
            expense_items.append(
                CategoryReportItem(
                    category_id=cat.id,
                    category_name=cat.name,
                    type=cat.type,
                    color=cat.color,
                    amount=expense,
                    count=count if cat.type != "income" else 0,
                    percentage=0.0,
                )
            )
            total_expense += expense

    # Add uncategorized
    income, expense, count = _sum_by_type(
        db=db,
        user_id=user_id,
        date_from=start,
        date_to=end,
    )

    # Compute uncategorized by subtracting categorized totals
    categorized_income = sum(i.amount for i in income_items)
    categorized_expense = sum(i.amount for i in expense_items)

    uncategorized_income = income - categorized_income
    uncategorized_expense = expense - categorized_expense

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

    # Calculate percentages
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

    # Remove zero-amount items and sort
    income_items = [i for i in income_items if i.amount > 0]
    expense_items = [i for i in expense_items if i.amount > 0]

    income_items.sort(key=lambda x: x.amount, reverse=True)
    expense_items.sort(key=lambda x: x.amount, reverse=True)

    return CategoryReportResponse(
        month_label=to_persian(start) or "",
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