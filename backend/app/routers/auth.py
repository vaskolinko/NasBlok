"""Registracija z vabilom, prijava in podatki o prijavljenem uporabniku (US-15)."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Building, BuildingMember, Contractor, Invitation, MemberRole, Unit, User
from app.schemas import LoginRequest, MeResponse, MembershipOut, RegisterRequest, TokenResponse
from app.security import DUMMY_HASH, create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["avtentikacija"])

LOGIN_ERROR = "Napačen e-poštni naslov ali geslo."


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # E-pošto vedno hranim in iščem z malimi črkami.
    user = db.scalars(select(User).where(User.email == data.email.lower())).first()

    if user is None:
        verify_password(data.password, DUMMY_HASH)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, LOGIN_ERROR)

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, LOGIN_ERROR)

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)

    invitation = db.scalars(
        select(Invitation)
        .where(Invitation.code == data.code.strip().upper())
        .with_for_update()
    ).first()

    if invitation is None or invitation.used_at is not None or invitation.expires_at < now:
        # Ne povem, ali koda ne obstaja, je porabljena ali je potekla, da kod ni
        # mogoče ugibati.
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Vabilo ni veljavno.")

    email = data.email.lower()
    if db.scalars(select(User).where(User.email == email)).first():
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Uporabnik s tem e-poštnim naslovom že obstaja."
        )

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        full_name=data.full_name.strip(),
        phone=data.phone,
    )
    db.add(user)
    db.flush() 

    db.add(
        BuildingMember(
            user_id=user.id,
            building_id=invitation.building_id,
            unit_id=invitation.unit_id,
            role=invitation.role,
        )
    )

    if invitation.role == MemberRole.CONTRACTOR:
        db.add(
            Contractor(
                user_id=user.id,
                company_name=(data.company_name or data.full_name).strip(),
                phone=data.phone,
            )
        )

    invitation.used_at = now
    db.commit()

    # Po registraciji uporabnik avtomatsko prijavljen.
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Vrne prijavljenega uporabnika in vse njegove vloge po stavbah.

    Frontend iz tega odgovora izriše meni, zato ne potrebuje lastne logike o vlogah.
    """
    rows = db.execute(
        select(BuildingMember, Building, Unit)
        .join(Building, Building.id == BuildingMember.building_id)
        .outerjoin(Unit, Unit.id == BuildingMember.unit_id)
        .where(BuildingMember.user_id == user.id)
        .order_by(Building.id)
    ).all()

    memberships = [
        MembershipOut(
            building_id=building.id,
            building_name=building.name,
            unit_id=unit.id if unit else None,
            unit_label=unit.label if unit else None,
            role=member.role,
        )
        for member, building, unit in rows
    ]
    return MeResponse(
        id=user.id, email=user.email, full_name=user.full_name, memberships=memberships
    )
