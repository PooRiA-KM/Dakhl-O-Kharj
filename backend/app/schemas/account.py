from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class AccountRead(BaseModel):
    id: int
    name: str
    type: str
    initial_balance: Decimal
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)