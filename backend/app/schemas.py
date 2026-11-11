"""Pydantic sheme za vhodne in izhodne podatke API-ja."""

from pydantic import BaseModel, EmailStr, Field

from app.models import MemberRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    code: str = Field(min_length=1, max_length=32)
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=50)
    # samo za serviserje; če ga ne vpišejo, se uporabi ime in priimek
    company_name: str | None = Field(default=None, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MembershipOut(BaseModel):
    building_id: int
    building_name: str
    unit_id: int | None
    unit_label: str | None
    role: MemberRole


class MeResponse(BaseModel):
    id: int
    email: str
    full_name: str
    memberships: list[MembershipOut]


class BuildingOut(BaseModel):
    id: int
    name: str
    address: str
