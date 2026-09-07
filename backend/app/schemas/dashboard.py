from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.transaction import (
    TransactionAccountRead,
    TransactionCategoryRead,
    TransactionType,
)


class SummaryResponse(BaseModel):
    income_this_month: Decimal
    expense_this_month: Decimal
    balance_this_month: Decimal
    total_income: Decimal
    total_expense: Decimal
    total_balance: Decimal
    current_month_start: datetime
    current_month_end: datetime
    current_month_label: str


class RecentTransactionRead(BaseModel):
    id: int
    title: str
    amount: Decimal
    type: TransactionType
    occurred_at: datetime
    occurred_at_persian: Optional[str] = None
    category: Optional[TransactionCategoryRead] = None
    account: Optional[TransactionAccountRead] = None

    model_config = ConfigDict(from_attributes=True)


class RecentTransactionsResponse(BaseModel):
    items: list[RecentTransactionRead]
    total: int


class MonthlyDataPoint(BaseModel):
    year: int
    month: int
    label: str
    income: Decimal
    expense: Decimal
    balance: Decimal


class MonthlyChartResponse(BaseModel):
    points: list[MonthlyDataPoint]


class CategoryChartItem(BaseModel):
    category_id: Optional[int]
    category_name: str
    color: Optional[str]
    amount: Decimal
    percentage: float
    count: int


class CategoryChartResponse(BaseModel):
    month_label: str
    total_expense: Decimal
    items: list[CategoryChartItem]