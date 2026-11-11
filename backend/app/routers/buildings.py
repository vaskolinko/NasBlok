"""Endpointi za stavbe. Zaenkrat samo branje, urejanje pride z US-01."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import ALL_ROLES, require_building_role
from app.models import Building, BuildingMember
from app.schemas import BuildingOut

router = APIRouter(prefix="/api/buildings", tags=["stavbe"])


@router.get("/{building_id}", response_model=BuildingOut)
def get_building(
    building_id: int,
    member: BuildingMember = Depends(require_building_role(*ALL_ROLES)),
    db: Session = Depends(get_db),
):
    # Podatke stavbe vidi vsak član stavbe, ne glede na vlogo. Kdor ni član,
    # dobi 403, kdor ni prijavljen, pa 401.
    return db.get(Building, building_id)
