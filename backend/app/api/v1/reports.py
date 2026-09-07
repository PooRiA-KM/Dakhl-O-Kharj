from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.report import (
    AccountReportResponse,
    CategoryReportResponse,
    MonthlyReportResponse,
)
from app.services import report_service

router = APIRouter()


@router.get("/monthly", response_model=MonthlyReportResponse)
def get_monthly_report(
    months: int = Query(default=12, ge=1, le=60),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.get_monthly_report(
        db=db,
        user_id=current_user.id,
        months=months,
    )


@router.get("/by-category", response_model=CategoryReportResponse)
def get_category_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.get_category_report(
        db=db,
        user_id=current_user.id,
    )


@router.get("/by-account", response_model=AccountReportResponse)
def get_account_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.get_account_report(
        db=db,
        user_id=current_user.id,
    )