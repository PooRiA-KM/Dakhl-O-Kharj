from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class MonthlyReportItem(BaseModel):
    year: int
    month: int
    label: str
    income: Decimal
    expense: Decimal
    balance: Decimal
    transaction_count: int


class MonthlyReportResponse(BaseModel):
    months: list[MonthlyReportItem]
    total_income: Decimal
    total_expense: Decimal
    total_balance: Decimal
    total_transactions: int


class CategoryReportItem(BaseModel):
    category_id: Optional[int]
    category_name: str
    type: str
    color: Optional[str]
    amount: Decimal
    count: int
    percentage: float


class CategoryReportResponse(BaseModel):
    month_label: str
    total_income: Decimal
    total_expense: Decimal
    income_items: list[CategoryReportItem]
    expense_items: list[CategoryReportItem]


class AccountReportItem(BaseModel):
    account_id: int
    account_name: str
    account_type: str
    initial_balance: Decimal
    current_balance: Decimal
    total_income: Decimal
    total_expense: Decimal
    transaction_count: int


class AccountReportResponse(BaseModel):
    items: list[AccountReportItem]
    total_balance: Decimal