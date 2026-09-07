from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class TransactionCategoryRead(BaseModel):
    id: int
    name: str
    type: str
    color: Optional[str] = None
    icon: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionAccountRead(BaseModel):
    id: int
    name: str
    type: str

    model_config = ConfigDict(from_attributes=True)


class TransactionBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0)
    type: TransactionType
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    occurred_at: Optional[datetime] = None
    description: Optional[str] = Field(default=None, max_length=5000)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    amount: Optional[Decimal] = Field(default=None, gt=0)
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    occurred_at: Optional[datetime] = None
    description: Optional[str] = Field(default=None, max_length=5000)


class TransactionRead(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    category: Optional[TransactionCategoryRead] = None
    account: Optional[TransactionAccountRead] = None

    model_config = ConfigDict(from_attributes=True)