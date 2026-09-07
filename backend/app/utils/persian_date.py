from datetime import date, datetime, timedelta, timezone

import jdatetime


def now_tehran() -> datetime:
    return datetime.now(timezone(timedelta(hours=3, minutes=30)))


def today_persian() -> jdatetime.date:
    return jdatetime.date.today()


def to_persian(dt: datetime | date | None) -> str | None:
    if dt is None:
        return None

    if isinstance(dt, datetime):
        pd = jdatetime.datetime.fromgregorian(datetime=dt)
    else:
        pd = jdatetime.date.fromgregorian(date=dt)

    return pd.strftime("%Y/%m/%d")


def to_persian_full(dt: datetime | None) -> str | None:
    if dt is None:
        return None

    pd = jdatetime.datetime.fromgregorian(datetime=dt)
    return pd.strftime("%Y/%m/%d %H:%M")


def gregorian_month_range(year: int, month: int) -> tuple[datetime, datetime]:
    """Start (inclusive) and end (exclusive) of a Gregorian month in UTC."""
    start = datetime(year, month, 1, tzinfo=timezone.utc)

    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

    return start, end


def current_month_start_end() -> tuple[datetime, datetime]:
    now = now_tehran()
    start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    if now.month == 12:
        end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)

    return start, end


def last_n_months(n: int = 12) -> list[dict]:
    """Returns last n months including current month, newest first."""
    now = now_tehran()
    result = []

    year = now.year
    month = now.month

    for _ in range(n):
        result.append(
            {
                "year": year,
                "month": month,
                "label": f"{year}/{month:02d}",
            }
        )

        month -= 1
        if month == 0:
            month = 12
            year -= 1

    return result