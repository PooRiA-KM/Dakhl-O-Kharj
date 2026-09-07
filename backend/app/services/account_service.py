from sqlalchemy.orm import Session

from app.models.account import Account


def get_accounts(db: Session, user_id: int) -> list[Account]:
    return (
        db.query(Account)
        .filter(Account.user_id == user_id)
        .order_by(Account.is_default.desc(), Account.created_at.asc())
        .all()
    )