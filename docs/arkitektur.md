# Arkitektur

## Stacken
| Del | Teknologi |
|---|---|
| Kundeapp (`app/`) | React Native + Expo + TypeScript (strict) |
| API (`server/`) | ASP.NET Core (.NET 10), `[ApiController]` som returnerer JSON |
| Admin og sjåfør (`server/`) | ASP.NET Core MVC + Razor Views, i samme prosjekt |
| Database | PostgreSQL + EF Core (migreringer) |
| Tester | xUnit (backend), Jest (app) |
| Innlogging og betaling | Vipps Login + Vipps MobilePay ePayment, kun fra backend |
| SMS | Sveve (REST-API via egen `HttpClient`, se ADR 0003) |
| Push | APNs og FCM direkte fra backend, uten persondata (ADR 0003) |
| Statistikk | Plausible (EU, uten informasjonskapsler) |
| Hosting | Scaleway Serverless Containers + Managed PostgreSQL, Paris (`fr-par`) |
| Deploy | Docker + GitHub Actions (kun fra `main`) |

## Hvordan delene henger sammen
```
 Kunde (iOS/Android)            Sjåfør / Admin (nettleser)
   Vasko-app (Expo)               Razor Views (/admin, /sjafor)
        │ HTTPS/JSON                    │ HTTPS + cookie + CSRF
        ▼                               ▼
 ┌──────────────────────────────────────────────────────┐
 │  Vasko.Server (ASP.NET Core, én container)             │
 │  Features/                                            │
 │   Bestillinger · Henting · Kunder · Betaling · Ruter  │
 │  Controller → Service → DbContext                      │
 └───────┬────────────┬────────────┬────────────┬───────┘
         ▼            ▼            ▼            ▼
   PostgreSQL     Vipps API     Sveve SMS    APNs / FCM
   (Scaleway,     (Login +      (Norge)      (push uten
    Paris)        ePayment)                   persondata)
```

## Prinsipper
- **Modulær monolitt.** Én applikasjon, én database og én container. Ingen mikrotjenester.
- **Organisert etter funksjon, ikke etter type.** Hver mappe i `Features/<Funksjon>/` har sin egen controller, service og modeller. Testene ligger i `tests/Vasko.Server.Tests/Features/<Funksjon>/`, som speiler strukturen. xUnit skal ikke inn i produksjonsbygget.
- **Tynne controllere.** De tar imot forespørselen, validerer, kaller servicen og returnerer en DTO. All forretningslogikk ligger i servicene.
- **Funksjoner snakker via servicer.** En funksjon kan kalle en annen funksjons *service*, men ikke dens `DbSet` eller controller direkte.
- **API kontra Razor:** API-controllere ligger under `/api/...` med token-autentisering for appen. Razor-controllere ligger under `/admin` og `/sjafor` med cookie og CSRF.
- **Eksterne tjenester bak grensesnitt** (`IPaymentGateway`, `ISmsSender`, `IPushSender`), slik at de kan erstattes med falske implementasjoner i tester.

## Mapper
```
server/
  Vasko.slnx  Dockerfile  Directory.Build.props  .editorconfig
  src/Vasko.Server/
    Program.cs
    Features/<Funksjon>/       Controller, Service, Models
    Views/                     Razor (admin, sjåfør)
    wwwroot/css/site.css       design-tokens som CSS-variabler
  tests/Vasko.Server.Tests/
    Features/<Funksjon>/       xUnit-tester
app/
  App.tsx
  src/theme/tokens.ts          design-tokens
  src/features/<funksjon>/     skjermer, komponenter, tester
```

## Miljøer
| Miljø | Database | Vipps | Utløses av |
|---|---|---|---|
| Lokalt | Postgres i Docker | Vipps test | `dotnet run` |
| Produksjon | Scaleway Managed PG | Vipps prod | push til `main` → `deploy.yml` |

Migreringer kjøres som et eget steg i deploy (EF-bundle), aldri ved oppstart av appen.
