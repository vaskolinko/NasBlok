"""Stavbe in stanovanja (US-01)."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import exists, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import ALL_ROLES, get_current_user, require_building_role
from app.models import (
    Building,
    BuildingMember,
    Invitation,
    Issue,
    MemberRole,
    Unit,
    User,
    Vote,
)
from app.schemas import BuildingCreate, BuildingOut, BuildingUpdate, UnitIn, UnitOut

router = APIRouter(prefix="/api/buildings", tags=["stavbe"])

# Odločitev: urejati stavbo sme samo upravnik te stavbe. Kdor stavbo ustvari,
# postane njen upravnik.
manager_only = require_building_role(MemberRole.MANAGER)

DUPLICATE_LABEL = "Stanovanje s to oznako že obstaja."


# --- Stavba ---

@router.post("", response_model=BuildingOut, status_code=status.HTTP_201_CREATED)
def create_building(
    data: BuildingCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    is_manager = db.scalar(
        select(
            exists().where(
                BuildingMember.user_id == user.id,
                BuildingMember.role == MemberRole.MANAGER,
            )
        )
    )
    if not is_manager:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Stavbo lahko ustvari samo upravnik.")

    building = Building(name=data.name, address=data.address)
    db.add(building)
    db.flush()
    db.add(BuildingMember(user_id=user.id, building_id=building.id, role=MemberRole.MANAGER))
    db.commit()
    db.refresh(building)
    return building


@router.get("/{building_id}", response_model=BuildingOut)
def get_building(
    building_id: int,
    member: BuildingMember = Depends(require_building_role(*ALL_ROLES)),
    db: Session = Depends(get_db),
):
    # Osnovne podatke stavbe vidi vsak član, ne glede na vlogo.
    return db.get(Building, building_id)


@router.patch("/{building_id}", response_model=BuildingOut)
def update_building(
    building_id: int,
    data: BuildingUpdate,
    member: BuildingMember = Depends(manager_only),
    db: Session = Depends(get_db),
):
    building = db.get(Building, building_id)
    if data.name is not None:
        building.name = data.name
    if data.address is not None:
        building.address = data.address
    db.commit()
    db.refresh(building)
    return building


# --- Stanovanja ---

def _get_unit(db: Session, building_id: int, unit_id: int) -> Unit:
    """Vrne stanovanje, a samo če res spada v to stavbo.

    Brez tega preverjanja bi lahko upravnik ene stavbe z ugibanjem številk
    urejal stanovanja v tuji stavbi.
    """
    unit = db.get(Unit, unit_id)
    if unit is None or unit.building_id != building_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Stanovanje ne obstaja.")
    return unit


@router.get("/{building_id}/units", response_model=list[UnitOut])
def list_units(
    building_id: int,
    member: BuildingMember = Depends(manager_only),
    db: Session = Depends(get_db),
):
    # Število članov preštejem kar v bazi
    rows = db.execute(
        select(Unit, func.count(BuildingMember.id))
        .outerjoin(BuildingMember, BuildingMember.unit_id == Unit.id)
        .where(Unit.building_id == building_id)
        .group_by(Unit.id)
        .order_by(Unit.id)
    ).all()
    return [UnitOut(id=unit.id, label=unit.label, member_count=count) for unit, count in rows]


@router.post(
    "/{building_id}/units", response_model=UnitOut, status_code=status.HTTP_201_CREATED
)
def create_unit(
    building_id: int,
    data: UnitIn,
    member: BuildingMember = Depends(manager_only),
    db: Session = Depends(get_db),
):
    unit = Unit(building_id=building_id, label=data.label)
    db.add(unit)
    _commit_or_duplicate(db)
    return UnitOut(id=unit.id, label=unit.label, member_count=0)


@router.patch("/{building_id}/units/{unit_id}", response_model=UnitOut)
def update_unit(
    building_id: int,
    unit_id: int,
    data: UnitIn,
    member: BuildingMember = Depends(manager_only),
    db: Session = Depends(get_db),
):
    unit = _get_unit(db, building_id, unit_id)
    unit.label = data.label
    _commit_or_duplicate(db)
    count = db.scalar(select(func.count(BuildingMember.id)).where(BuildingMember.unit_id == unit.id))
    return UnitOut(id=unit.id, label=unit.label, member_count=count)


@router.delete("/{building_id}/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit(
    building_id: int,
    unit_id: int,
    member: BuildingMember = Depends(manager_only),
    db: Session = Depends(get_db),
):
    unit = _get_unit(db, building_id, unit_id)

    
    checks = [
        (BuildingMember.unit_id, "na stanovanje so vezani stanovalci"),
        (Vote.unit_id, "stanovanje je že glasovalo"),
        (Issue.unit_id, "na stanovanje so vezane prijave okvar"),
        (Invitation.unit_id, "za stanovanje obstaja vabilo"),
    ]
    for column, reason in checks:
        if db.scalar(select(exists().where(column == unit.id))):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Stanovanja ni mogoče izbrisati, ker {reason}.",
            )

    db.delete(unit)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _commit_or_duplicate(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_LABEL)
