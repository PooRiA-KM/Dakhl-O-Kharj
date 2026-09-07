from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # income / expense / both
    type: Mapped[str] = mapped_column(
        String(10),
        default="expense",
        nullable=False,
    )

    color: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )

    icon: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="categories",
    )

    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="category",
    )