# Avtentikacija z JWT žetonom v glavi Authorization

## Kontekst in problem

Frontend in backend sta ločeni aplikaciji, zato mora backend pri vsakem zahtevku vedeti, kdo ga pošilja in kakšno vlogo ima v stavbi. Odločiti sem se moral, kako se uporabnik prijavi in kako frontend dokazuje prijavo pri naslednjih zahtevkih.

## Obravnavane možnosti

* JWT žeton, ki ga frontend hrani v localStorage in pošilja v glavi Authorization
* JWT žeton v piškotku httpOnly
* Seja na strežniku, shranjena v bazi

## Odločitev

Izbrana možnost: JWT žeton v glavi Authorization, ker je najpreprostejši za ločen frontend in backend, FastAPI pa ga podpira brez dodatnih knjižnic. Backendu ni treba hraniti sej, žeton pa po osvežitvi strani ostane veljaven. V žeton zapišem samo id uporabnika, vloge pa ob vsakem zahtevku preberem iz baze, zato odvzem vloge velja takoj.

Piškotek httpOnly je varnejši pred krajo žetona, vendar zahteva še zaščito pred CSRF, kar bi za prvo različico pomenilo preveč dela. Seja na strežniku bi zahtevala dodatno tabelo in brisanje starih sej.

### Posledice

* Dobro, ker je prijava preprosta in deluje enako za vse zaslone.
* Dobro, ker backend ne hrani sej in ga je lažje testirati.
* Slabo, ker bi zlonamerna skripta na strani lahko prebrala žeton iz localStorage, zato je prehod na piškotek httpOnly možna kasnejša nadgradnja.
* Slabo, ker žetona pred iztekom ni mogoče preklicati, zato velja samo 8 ur.
