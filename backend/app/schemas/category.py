from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryType(str, Enum):
    income = "income"
    expense = "expense"
    both = "both"


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: CategoryType
    color: Optional[str] = Field(default=None, max_length=20)
    icon: Optional[str] = Field(default=None, max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    type: Optional[CategoryType] = None
    color: Optional[str] = Field(default=None, max_length=20)
    icon: Optional[str] = Field(default=None, max_length=50)


class CategoryRead(BaseModel):
    id: int
    user_id: int
    name: str
    type: str
    color: Optional[str] = None
    icon: Optional[str] = None
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)