---
name: ny-funksjon
description: Fast arbeidsrekkefølge for å bygge en ny funksjon eller utvide en eksisterende i Vasko (backend, app eller begge). Bruk når brukeren ber om en ny funksjon, et nytt endepunkt, en ny skjerm eller en ny Razor-side.
---

# Ny funksjon

Følg stegene i rekkefølge. Ikke hopp over noen.

## 1. Plan (vis brukeren før du koder)
- Hva skal funksjonen gjøre, og for hvilken rolle (kunde, sjåfør, vaskeripartner, admin)?
- Hvilken `Features/<Funksjon>/` hører den til (`Bestillinger`, `Henting`, `Kunder`, `Betaling`, `Ruter`)? Trengs en ny funksjonsmappe, avtales det med brukeren først.
- Hvilke data er involvert? Er noe sensitivt (dørkode, adresse, fraværsvindu, betaling)? Da gjelder `docs/sikkerhet.md` i sin helhet.
- Trengs databaseendring (bruk skillen `databaseendring`), betaling (`vipps-betaling`) eller meldinger (`kundemeldinger`)?
- Lag en liste over filer du vil opprette eller endre, og hvilke tester du vil skrive.

## 2. Tester først
- **Backend:** `server/tests/Vasko.Server.Tests/Features/<Funksjon>/<Navn>ServiceTests.cs`. Test forretningsreglene i servicen. Test i tillegg autorisasjonen (feil rolle gir 403, annen kundes data gir 404) med `WebApplicationFactory<Program>`.
- **App:** `app/src/features/<funksjon>/<Navn>.test.tsx` med Jest.
- Kjør testene og se at de **feiler** av riktig grunn.

## 3. Implementer i riktig mappe
**Backend** (`server/src/Vasko.Server/Features/<Funksjon>/`):
```
<Navn>Controller.cs     [ApiController] [Route("api/<ressurs>")], eller Razor-controller for admin/sjåfør
<Navn>Service.cs        all forretningslogikk, registreres i DI
Models/<Navn>Request.cs, <Navn>Response.cs   record-DTO-er med validering
<Funksjon>Entities.cs   EF-entiteter (eksponeres aldri direkte)
```
- Controlleren tar imot forespørselen, validerer, kaller servicen og returnerer en DTO. Maks ca. 10 linjer per action.
- Hver action har `[Authorize(Policy = ...)]`.
- Eksterne tjenester brukes via grensesnitt (`ISmsSender`, `IPaymentGateway`).

**App** (`app/src/features/<funksjon>/`): skjerm, komponenter, API-kall og test. Bruk bare tokens fra `src/theme/tokens.ts`.

## 4. Grønt lokalt
- `cd server && dotnet format && dotnet build && dotnet test`
- `cd app && npm run verify`

## 5. Review
1. Lag en diff (`git diff`) og en liste over endrede filer. Reviewerne har ikke Bash, så diffen må sendes med.
2. Kjør agenten **sikkerhetsreviewer** med diffen. Rett alle funn merket KRITISK og HØY.
3. Kjør agenten **vasko-reviewer** med diffen hvis UI eller tekst er endret. Rett alt under «Må endres».
4. Oppsummer for brukeren: hva er laget, hvilke tester er skrevet, hvilke review-funn er rettet og hvilke er åpne.
