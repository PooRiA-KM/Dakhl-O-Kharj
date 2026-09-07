from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None
    iat: int | None = None
    type: str | None = None