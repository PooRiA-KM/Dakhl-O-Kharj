from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class AdminUserRead(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    transaction_count: int = 0
    total_income: Decimal = Decimal("0")
    total_expense: Decimal = Decimal("0")
    last_transaction_at: Optional[datetime] = None


class AdminUserListResponse(BaseModel):
    items: list[AdminUserRead]
    total: int


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class RegistrationPoint(BaseModel):
    year: int
    month: int
    label: str
    count: int


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    admin_users: int
    new_users_this_month: int
    total_transactions: int
    total_income: Decimal
    total_expense: Decimal
    registrations: list[RegistrationPoint]
    recent_users: list[AdminUserRead]


class AdminTransactionUser(BaseModel):
    id: int
    full_name: str
    email: str


class AdminTransactionRead(BaseModel):
    id: int
    title: str
    amount: Decimal
    type: str
    occurred_at: datetime
    description: Optional[str] = None
    category_name: Optional[str] = None
    account_name: Optional[str] = None
    user: AdminTransactionUser


class AdminTransactionListResponse(BaseModel):
    items: list[AdminTransactionRead]
    total: int