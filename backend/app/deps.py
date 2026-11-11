"""FastAPI odvisnosti za prijavo in preverjanje vlog (issue: preverjanje vlog na backendu)."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BuildingMember, MemberRole, User
from app.security import decode_access_token

# auto_error=False, da napako in njeno besedilo določim sam (401 v slovenščini).
bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Vrne prijavljenega uporabnika ali vrne 401, če prijave ni."""
    if credentials is None:
        raise _unauthorized("Niste prijavljeni.")

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise _unauthorized("Prijava je potekla ali ni veljavna. Prijavite se znova.")

    user = db.get(User, user_id)
    if user is None:
        raise _unauthorized("Uporabnik ne obstaja.")
    return user


def require_building_role(*roles: MemberRole):
    """Ustvari odvisnost, ki preveri, ali ima uporabnik v stavbi eno od naštetih vlog.

    Uporaba v endpointu:
        @router.post("/buildings/{building_id}/polls")
        def create_poll(building_id: int,
                        member: BuildingMember = Depends(require_building_role(MemberRole.MANAGER))):

    Odločitev: vloga je vezana na stavbo, ne na uporabnika. Ista oseba je lahko
    lastnik v eni stavbi in nima nobene vloge v drugi, zato preverjam vedno
    vlogo v stavbi iz naslova (building_id). Predstavnik lastnikov ima v bazi
    dve vrstici, OWNER in REPRESENTATIVE, zato ima samodejno vse pravice lastnika.
    """

    def checker(
        building_id: int,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> BuildingMember:
        membership = db.scalars(
            select(BuildingMember).where(
                BuildingMember.user_id == user.id,
                BuildingMember.building_id == building_id,
                BuildingMember.role.in_(roles),
            )
        ).first()
        if membership is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Za to dejanje nimate pravic.",
            )
        return membership

    return checker


ALL_ROLES = tuple(MemberRole)
