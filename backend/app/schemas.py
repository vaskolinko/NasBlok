"""Pydantic sheme za vhodne in izhodne podatke API-ja."""

from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, StringConstraints

from app.models import MemberRole

# Besedilo, ki mu odrežem presledke na začetku in koncu in ne sme biti prazno.
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
UnitLabel = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


# --- Avtentikacija ---

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


# --- Stavbe in stanovanja ---

class BuildingOut(BaseModel):
    id: int
    name: str
    address: str


class BuildingCreate(BaseModel):
    name: Name
    address: Name


class BuildingUpdate(BaseModel):
    # Pri urejanju pošlje frontend samo polja, ki se spreminjajo.
    name: Name | None = None
    address: Name | None = None


class UnitIn(BaseModel):
    label: UnitLabel


class UnitOut(BaseModel):
    id: int
    label: str
    member_count: int
