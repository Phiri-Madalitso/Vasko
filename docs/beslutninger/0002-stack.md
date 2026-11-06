# 0002 Teknologistack

**Status:** Vedtatt (2026-11-07)

## Kontekst
Grunnleggerne kan C#/.NET og TypeScript. Vi trenger én kundeapp for iOS og Android, en enkel admin og sjåførflate, og norsk innlogging og betaling.

## Beslutning
| Del | Valg |
|---|---|
| Kundeapp | React Native + Expo (SDK 58) + TypeScript strict |
| Backend | ASP.NET Core .NET 10: `[ApiController]` for appen, MVC + Razor for admin og sjåfør |
| Database | PostgreSQL + EF Core-migreringer |
| Tester | xUnit og Jest |
| Innlogging og betaling | Vipps Login + Vipps MobilePay ePayment, kun fra backend |
| SMS | Sveve, via REST-API-et med egen `HttpClient` (ikke NuGet-pakken `Sveve`, se under) |
| Statistikk | Plausible |
| Hosting | Scaleway Serverless Containers + Managed PostgreSQL, `fr-par` |
| CI/CD | GitHub Actions + Docker |
| Node | 22 LTS (`.nvmrc`). Expo-verktøyene krever ≥ 22.13. |

**Sveve:** NuGet-pakken `Sveve` er laget av en privatperson, ikke verifisert, og har få nedlastinger. Den ville fått API-nøkkelen vår og alle telefonnumre. Sveves API er ett enkelt HTTP-kall, så vi skriver en liten `SveveSmsSender : ISmsSender` selv.

## Konsekvenser
- ➕ Ett språk per side og felles C#-kode for API og admin.
- ➕ Vipps gir både innlogging og betaling, og alle nordmenn har det.
- ➖ Serverless Containers kan ha kald start. Akseptabelt i piloten. Ved behov settes `min-scale=1`.
- ➖ Razor gir enklere UI enn en SPA. Det er bevisst valgt for admin og sjåfør.
