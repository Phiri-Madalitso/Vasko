---
name: databaseendring
description: Regler for EF Core-migreringer i Vasko (nye tabeller, kolonner, indekser, endringer av typer, rename og sletting). Bruk før du endrer en entitet eller DbContext, eller lager en migrering.
---

# Databaseendring

**Prinsipp:** hver migrering kan reverseres, og ingen data går tapt.

## Fremgangsmåte
1. Endre entiteten eller konfigurasjonen i `Features/<Funksjon>/`.
2. Lag migreringen:
   ```
   cd server
   dotnet ef migrations add <BeskrivendeNavn> -p src/Vasko.Server
   ```
   Navnet skal være på engelsk og beskrive endringen: `AddPickupWindowToOrder`, ikke `Update3`.
3. **Les den genererte migreringen linje for linje.** Både `Up()` og `Down()` skal være korrekte.
4. Generer SQL og les den:
   ```
   dotnet ef migrations script <ForrigeMigrering> <NyMigrering> -p src/Vasko.Server --idempotent
   ```
5. **Test mot en kopi først.** Kjør `Up()`, så `Down()`, så `Up()` mot en lokal Postgres med syntetiske testdata (aldri produksjonsdata på en utviklermaskin). Sjekk at dataene er intakte.
6. Skriv en test i `tests/.../Features/<Funksjon>/` som dekker den nye strukturen.

## Farlige endringer: del dem opp (expand → migrate → contract)
| Endring | Slik gjør du det trygt |
|---|---|
| Rename av kolonne eller tabell | EF lager ofte DROP og ADD. Skriv `RenameColumn` manuelt. |
| Slette en kolonne | PR 1: slutt å bruke kolonnen i koden. PR 2 (etter deploy): slett den. |
| Gjøre en kolonne `NOT NULL` | Legg til som nullable, fyll ut verdier, gjør den deretter `NOT NULL`. |
| Endre type | Ny kolonne, kopier data, bytt kode, slett den gamle i en senere PR. |
| Kryptert felt | Ny kryptert kolonne, kryptering av eksisterende rader i en egen migrering eller jobb, og slett ukryptert kolonne til slutt. |

`DropTable`, `DropColumn` og `migrationBuilder.Sql("DELETE ...")` krever at brukeren har bekreftet eksplisitt.

## Sensitive felt
Dørkode, gateadresse og leveringsinstruks skal ha kryptert value converter (se `docs/sikkerhet.md`). Indekser aldri på krypterte felt.

## Produksjon
Migreringer kjøres som en EF-bundle i deploy-workflowen **før** ny container rulles ut (se skillen `deploy`). Aldri `Database.Migrate()` ved oppstart, og aldri `dotnet ef database update` mot produksjon fra en utviklermaskin. Ta et snapshot av Scaleway-databasen før store migreringer.
