from decimal import Decimal


def format_money(amount: Decimal | float | int) -> str:
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))

    # Format with thousands separator
    sign, digits, exp = amount.as_tuple()
    delta = exp + len(digits)
    number = "".join(str(d) for d in digits)

    if delta <= 0:
        number = "0" * (1 - delta) + number
        delta = 1

    integer_part = number[:delta] or "0"
    decimal_part = number[delta:]

    # Add comma separator
    chunks = []
    for i in range(len(integer_part), 0, -3):
        chunks.append(integer_part[max(0, i - 3) : i])

    chunks.reverse()
    integer_str = ",".join(chunks)

    if decimal_part:
        return f"{integer_str}.{decimal_part}"
    return integer_str