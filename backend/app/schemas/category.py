from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CategoryRead(BaseModel):
    id: int
    name: str
    type: str
    color: Optional[str] = None
    icon: Optional[str] = None
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)