from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import (
    CategoryChartResponse,
    MonthlyChartResponse,
    RecentTransactionsResponse,
    SummaryResponse,
)
from app.services import dashboard_service

router = APIRouter()


@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_summary(
        db=db,
        user_id=current_user.id,
    )


@router.get("/recent-transactions", response_model=RecentTransactionsResponse)
def get_recent_transactions(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_recent_transactions(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )


@router.get("/charts/monthly", response_model=MonthlyChartResponse)
def get_monthly_chart(
    months: int = Query(default=12, ge=1, le=36),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_monthly_chart(
        db=db,
        user_id=current_user.id,
        months=months,
    )


@router.get("/charts/category", response_model=CategoryChartResponse)
def get_category_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_category_chart(
        db=db,
        user_id=current_user.id,
    )