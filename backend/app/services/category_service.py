from typing import Optional

from sqlalchemy.orm import Session

from app.models.category import Category


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