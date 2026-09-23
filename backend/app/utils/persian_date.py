from datetime import datetime, timedelta, timezone
from typing import Union

import jdatetime

TEHRAN_TZ = timezone(timedelta(hours=3, minutes=30))

JALALI_MONTH_NAMES = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
]


def now_tehran() -> datetime:
    return datetime.now(TEHRAN_TZ)


def today_jalali() -> jdatetime.date:
    return jdatetime.date.fromgregorian(date=now_tehran().date())


def to_persian(dt: Union[datetime, None]) -> str | None:
    if dt is None:
        return None

    pd = jdatetime.datetime.fromgregorian(datetime=dt)
    return pd.strftime("%Y/%m/%d")


def to_persian_full(dt: Union[datetime, None]) -> str | None:
    if dt is None:
        return None

    pd = jdatetime.datetime.fromgregorian(datetime=dt)
    return pd.strftime("%Y/%m/%d %H:%M")


def jalali_month_label(jyear: int, jmonth: int) -> str:
    return f"{JALALI_MONTH_NAMES[jmonth - 1]} {jyear}"


def jalali_month_range(jyear: int, jmonth: int) -> tuple[datetime, datetime]:
    """بازه میلادی معادل یک ماه شمسی، با مرز نیمه‌شب تهران."""
    start_j = jdatetime.date(jyear, jmonth, 1)

    if jmonth == 12:
        end_j = jdatetime.date(jyear + 1, 1, 1)
    else:
        end_j = jdatetime.date(jyear, jmonth + 1, 1)

    sg = start_j.togregorian()
    eg = end_j.togregorian()

    start = datetime(sg.year, sg.month, sg.day, tzinfo=TEHRAN_TZ)
    end = datetime(eg.year, eg.month, eg.day, tzinfo=TEHRAN_TZ)

    return start, end


def current_jalali_month_range() -> tuple[datetime, datetime]:
    today = today_jalali()
    return jalali_month_range(today.year, today.month)


def last_n_jalali_months(n: int = 12) -> list[dict]:
    """لیست n ماه شمسی اخیر، از جدید به قدیم."""
    today = today_jalali()
    year, month = today.year, today.month

    result: list[dict] = []

    for _ in range(n):
        result.append(
            {
                "year": year,
                "month": month,
                "label": jalali_month_label(year, month),
            }
        )

        month -= 1
        if month == 0:
            month = 12
            year -= 1

    return result