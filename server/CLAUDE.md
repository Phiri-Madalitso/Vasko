# server/: backend, API og Razor

ASP.NET Core .NET 10. Ett prosjekt (`src/Vasko.Server`) med både `[ApiController]` for appen og MVC + Razor for admin og sjåfør. Tester ligger i `tests/Vasko.Server.Tests`.

## Struktur
- Kode organiseres etter funksjon: `src/Vasko.Server/Features/<Funksjon>/`, med controller, service og modeller samlet.
- Tester speiler strukturen: `tests/Vasko.Server.Tests/Features/<Funksjon>/`.
- Delt infrastruktur (DbContext, kryptering, autorisasjonspolicyer) legges i `src/Vasko.Server/Infrastructure/` når den trengs.

## Regler
- **Tynne controllere.** De tar imot forespørselen, validerer, kaller servicen og returnerer en DTO. Ingen EF-spørringer i controlleren.
- **Returner aldri EF-entiteter.** Bruk `record`-DTO-er (`XxxRequest` og `XxxResponse`).
- **Autorisasjon:** hver action har `[Authorize(Policy = Policies.X)]`. Policyene defineres samlet. Eierskap (kunde A mot kunde B) sjekkes i servicen.
- **API** (`/api/...`): JSON, `ProblemDetails` ved feil og token-autentisering. Ingen cookies.
- **Razor** (`/admin`, `/sjafor`): cookie-autentisering, `AutoValidateAntiforgeryToken`, `<form asp-action>` og ingen `Html.Raw` med brukerdata. CSS kun via `var(--vasko-*)` i `wwwroot/css/site.css`. Mobil først for sjåførsidene (de brukes på telefon).
- **Dørkode og adresse:** krypteres med en EF value converter, eksponeres kun via egne endepunkter med policyen `SjaforPaAktivRute` eller for eieren, og logges aldri.
- **Konfigurasjon:** via `IOptions<T>` og miljøvariabler (`Vipps__ClientId`). Aldri hemmeligheter i `appsettings*.json`.
- **Data Protection-nøkler** lagres i Postgres når DbContext finnes. Det er påkrevd på Scaleway.
- **Migreringer:** bruk skillen `databaseendring`. Aldri `Database.Migrate()` ved oppstart.
- **Eksterne tjenester** (Vipps, Sveve, APNs/FCM) brukes via grensesnitt, og mockes i tester.
- `TreatWarningsAsErrors` er på. Rett advarselen; ikke undertrykk den uten en kommentar som forklarer hvorfor.

## Kommandoer
```
dotnet build
dotnet test
dotnet format                      # retter formatering
dotnet format --verify-no-changes  # det CI sjekker
dotnet run --project src/Vasko.Server   # http://localhost:5197, helsesjekk på /health
```
