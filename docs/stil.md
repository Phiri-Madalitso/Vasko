# Kodestil

## Språk
- **Kode på engelsk:** klasser, metoder, variabler, kommentarer i koden, commit-meldinger og API-ruter.
- **Funksjonsmapper på norsk** (`Features/Bestillinger/`), fordi de speiler domenet. Typene inni er engelske (`OrderService`, `CreateOrderRequest`).
- **All tekst kunden eller sjåføren ser er på norsk bokmål.** Det gjelder også feilmeldinger, valideringstekster, SMS og push.
- Dokumentasjon i `docs/` og `CLAUDE.md` skrives på norsk.

## Felles
- Små filer og små funksjoner. Én ting per fil.
- Ingen død kode og ingen utkommenterte blokker. Git husker.
- Navngi etter domenet: `Pickup`, `Delivery`, `Order`, `Route`, `DoorCode`, `VaskoBox`.
- Kommentarer forklarer *hvorfor*, ikke *hva*.
- Testnavn: `Metode_Scenario_Forventet` i C# og `'does X when Y'` i Jest.

## C# (`server/`)
- Følg `.editorconfig`. `dotnet format --verify-no-changes` må gå grønt (sjekkes av hook og CI).
- `Nullable` og `TreatWarningsAsErrors` er på. Bruk ikke `!` for å tie kompilatoren uten en kommentar som forklarer hvorfor.
- File-scoped namespaces, primærkonstruktører for DI og `record` for DTO-er.
- `async` hele veien. Send med `CancellationToken`. Aldri `.Result` eller `.Wait()`.
- Navngiving: `PascalCase` for typer og medlemmer, `camelCase` for lokale variabler og parametre, `_camelCase` for private felt.
- DTO-er: `XxxRequest` og `XxxResponse`. Returner aldri EF-entiteter direkte fra en controller.
- Valider input i request-modellen (DataAnnotations eller en egen validator) og i servicen når regelen er forretningslogikk.
- Logg med strukturert logging (`logger.LogInformation("Order {OrderId} created", id)`). Aldri persondata (se `sikkerhet.md`).

## TypeScript (`app/`)
- `strict` er på, sammen med `noUncheckedIndexedAccess`. Ingen `any`. Bruk `unknown` og snevre inn typen.
- Funksjonelle komponenter og hooks. Én komponent per fil, i `PascalCase.tsx`.
- Farger, skrifter og avstand hentes **kun** fra `src/theme/tokens.ts`. Ingen hardkodede hex-verdier.
- Kode organiseres etter funksjon i `src/features/<funksjon>/`, med testen ved siden av (`X.test.tsx`).
- `camelCase` for variabler og funksjoner, `PascalCase` for komponenter og typer, `SCREAMING_SNAKE` kun for ekte konstanter.
- Alt som kommer fra API-et, typesjekkes eller valideres ved grensen.
