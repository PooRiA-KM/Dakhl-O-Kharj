from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.category import Category
from app.models.user_setting import UserSetting


def create_default_user_data(db: Session, user_id: int) -> None:
    setting = UserSetting(user_id=user_id)
    db.add(setting)

    default_account = Account(
        user_id=user_id,
        name="حساب اصلی",
        type="bank",
        initial_balance=0,
        is_default=True,
    )
    db.add(default_account)

    expense_categories = [
        ("خوراک", "#ef4444"),
        ("حمل‌ونقل", "#f97316"),
        ("قبوض", "#eab308"),
        ("مسکن", "#84cc16"),
        ("درمان", "#22c55e"),
        ("پوشاک", "#14b8a6"),
        ("سرگرمی", "#3b82f6"),
        ("آموزش", "#6366f1"),
        ("متفرقه", "#6b7280"),
    ]

    income_categories = [
        ("حقوق", "#22c55e"),
        ("پروژه", "#10b981"),
        ("هدیه", "#84cc16"),
        ("سود سرمایه‌گذاری", "#14b8a6"),
        ("متفرقه", "#6b7280"),
    ]

    for name, color in expense_categories:
        db.add(
            Category(
                user_id=user_id,
                name=name,
                type="expense",
                color=color,
                is_default=True,
            )
        )

    for name, color in income_categories:
        db.add(
            Category(
                user_id=user_id,
                name=name,
                type="income",
                color=color,
                is_default=True,
            )
        )