from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_category_by_id_for_user(
    db: Session,
    category_id: int,
    user_id: int,
) -> Category:
    category = (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.user_id == user_id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="دسته‌بندی یافت نشد.",
        )

    return category


def get_categories(
    db: Session,
    user_id: int,
    category_type: Optional[str] = None,
) -> list[Category]:
    query = db.query(Category).filter(Category.user_id == user_id)

    if category_type:
        query = query.filter(Category.type.in_([category_type, "both"]))

    return (
        query
        .order_by(Category.is_default.desc(), Category.name.asc())
        .all()
    )


def create_category(
    db: Session,
    user_id: int,
    payload: CategoryCreate,
) -> Category:
    category = Category(
        user_id=user_id,
        name=payload.name,
        type=payload.type.value,
        color=payload.color,
        icon=payload.icon,
        is_default=False,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def update_category(
    db: Session,
    user_id: int,
    category_id: int,
    payload: CategoryUpdate,
) -> Category:
    category = get_category_by_id_for_user(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    update_data = payload.model_dump(exclude_unset=True)

    if "type" in update_data and update_data["type"] is not None:
        new_type = update_data["type"]
        if hasattr(new_type, "value"):
            update_data["type"] = new_type.value
        else:
            update_data["type"] = str(new_type)

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


def delete_category(
    db: Session,
    user_id: int,
    category_id: int,
) -> None:
    category = get_category_by_id_for_user(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    # قطع اتصال تراکنش‌ها از این دسته‌بندی
    db.query(Transaction).filter(
        Transaction.category_id == category_id,
        Transaction.user_id == user_id,
    ).update(
        {Transaction.category_id: None},
        synchronize_session=False,
    )

    db.delete(category)
    db.commit()