"""Testni podatki za razvoj.

Zagon (v mapi backend, z aktiviranim venv):
    python -m app.seed

Odločitev: registracija je mogoča samo z vabilom, vabila pa ustvarja upravnik.
Prvi upravnik zato ne more nastati prek aplikacije, ampak ga ustvari ta skripta.
Hkrati ustvari še uporabnike vseh vlog, da lahko vsako vlogo preizkusim.
Skripta je varna za večkratni zagon: če podatki že obstajajo, ne naredi ničesar.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.database import SessionLocal
from app.models import (
    Building,
    BuildingMember,
    Contractor,
    Invitation,
    IssueCategory,
    MemberRole,
    Unit,
    User,
)
from app.security import hash_password

PASSWORD = "geslo1234"


def run() -> None:
    db = SessionLocal()
    try:
        if db.scalars(select(User).where(User.email == "upravnik@nasblok.si")).first():
            print("Testni podatki že obstajajo, ne spreminjam ničesar.")
            return

        password_hash = hash_password(PASSWORD)

        def user(email: str, name: str) -> User:
            return User(email=email, password_hash=password_hash, full_name=name)

        manager = user("upravnik@nasblok.si", "Uroš Upravnik")
        owner = user("lastnik@nasblok.si", "Maja Lastnik")
        representative = user("predstavnik@nasblok.si", "Petra Predstavnik")
        tenant = user("najemnik@nasblok.si", "Nejc Najemnik")
        contractor_user = user("serviser@nasblok.si", "Sandi Serviser")
        db.add_all([manager, owner, representative, tenant, contractor_user])
        db.flush()

        building = Building(name="Prešernova 12", address="Prešernova ulica 12, Ljubljana")
        db.add(building)
        db.flush()

        units = [Unit(building_id=building.id, label=f"Stanovanje {i}") for i in range(1, 21)]
        db.add_all(units)
        db.flush()

        def member(u: User, role: MemberRole, unit: Unit | None = None) -> BuildingMember:
            return BuildingMember(
                user_id=u.id,
                building_id=building.id,
                unit_id=unit.id if unit else None,
                role=role,
            )

        db.add_all(
            [
                member(manager, MemberRole.MANAGER),
                member(owner, MemberRole.OWNER, units[6]),
                # predstavnik je tudi lastnik, zato ima dve vrstici
                member(representative, MemberRole.OWNER, units[0]),
                member(representative, MemberRole.REPRESENTATIVE),
                member(tenant, MemberRole.TENANT, units[2]),
                member(contractor_user, MemberRole.CONTRACTOR),
            ]
        )
        db.add(
            Contractor(
                user_id=contractor_user.id,
                company_name="Sandi servis",
                specialty=IssueCategory.ELECTRICAL,
            )
        )

        expires = datetime.now(timezone.utc) + timedelta(days=30)
        db.add_all(
            [
                Invitation(
                    code="LASTNIK-TEST",
                    building_id=building.id,
                    unit_id=units[9].id,
                    role=MemberRole.OWNER,
                    created_by=manager.id,
                    expires_at=expires,
                ),
                Invitation(
                    code="NAJEMNIK-TEST",
                    building_id=building.id,
                    unit_id=units[10].id,
                    role=MemberRole.TENANT,
                    created_by=owner.id,
                    expires_at=expires,
                ),
            ]
        )

        db.commit()
        print("Testni podatki so ustvarjeni.")
        print(f"Vsi uporabniki imajo geslo: {PASSWORD}")
        print("  upravnik@nasblok.si, lastnik@nasblok.si, predstavnik@nasblok.si,")
        print("  najemnik@nasblok.si, serviser@nasblok.si")
        print("Kode vabil za preizkus registracije: LASTNIK-TEST, NAJEMNIK-TEST")
    finally:
        db.close()


if __name__ == "__main__":
    run()
