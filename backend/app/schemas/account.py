from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AccountType(str, Enum):
    cash = "cash"
    bank = "bank"
    card = "card"
    wallet = "wallet"


class AccountBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: AccountType
    initial_balance: Decimal = Field(default=Decimal("0"), ge=Decimal("0"))
    is_default: bool = False


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    type: Optional[AccountType] = None
    initial_balance: Optional[Decimal] = Field(default=None, ge=Decimal("0"))
    is_default: Optional[bool] = None


class AccountRead(BaseModel):
    id: int
    user_id: int
    name: str
    type: str
    initial_balance: Decimal
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)