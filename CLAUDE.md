# Vasko

Eksklusiv vaske- og rensetjeneste: «Oda for klesvask». Kunden bestiller i appen og setter tøyet utenfor døra, og vi henter, vasker og leverer det strøkent i en Vasko-boks. Pilot med rundt 50 kunder. To grunnleggere utvikler.

@docs/visjon.md
@docs/sikkerhet.md
@docs/arkitektur.md
@docs/stil.md

## Repo
- `app/`: kundeapp (Expo + TypeScript strict). Egne regler i `app/CLAUDE.md`.
- `server/`: ASP.NET Core .NET 10 (API + Razor for admin og sjåfør). Egne regler i `server/CLAUDE.md`.
- `docs/beslutninger/`: ADR-er. Les dem før du foreslår endringer i stack eller leverandører.

## Ufravikelige regler
1. **Sikkerhet først.** Dørkoder og adresser er like sensitive som husnøkler. Følg `docs/sikkerhet.md`. Er du i tvil, spør.
2. **Ingen hemmeligheter i kode eller Git.** Rør aldri `.env` (hooken blokkerer det). Nye variabelnavn legges i `.env.example`.
3. **Ingen ny leverandør eller pakke som ser persondata uten en ADR** (ADR 0003). Kundedata forlater ikke EU/EØS.
4. **Stacken er bestemt** (ADR 0002). Ikke foreslå alternativer uten at brukeren ber om det.
5. **Ikke bygg mer enn det som er bedt om.** Piloten har 50 kunder, så velg det enkleste som føles eksklusivt.
6. **Kode på engelsk, all tekst brukeren ser på norsk bokmål.**

## Arbeidsflyt
- Ny funksjon: bruk skillen `ny-funksjon` (plan → tester først → implementering → review).
- Databaseendring: `databaseendring`. Betaling og innlogging: `vipps-betaling`. SMS og push: `kundemeldinger`. UI: `vasko-design`. Utrulling: `deploy`.
- Før PR: kjør agenten `sikkerhetsreviewer`, og i tillegg `vasko-reviewer` hvis UI eller tekst er endret. Begge trenger diffen som input.
- Commit-meldinger på engelsk i imperativ: `Add pickup window to order`.

## Kommandoer
| | |
|---|---|
| Backend | `cd server && dotnet build && dotnet test && dotnet format --verify-no-changes` |
| App | `cd app && npm run verify` (tsc + ESLint + Jest) |
| Kjør lokalt | `cd server && dotnet run --project src/Vasko.Server` · `cd app && npx expo start` |

## Automatiske vakter (`.claude/settings.json`)
- **PreToolUse** `beskytt-hemmeligheter.mjs`: blokkerer `.env`-filer og innhold som ligner nøkler.
- **PostToolUse** `sjekk-etter-endring.mjs`: `dotnet format` på endrede `server/`-filer, og `tsc` og ESLint på `app/`.
- **Stop** `kjor-tester.mjs`: `dotnet test` og Jest for områdene som er endret. Feilende tester må rettes før du er ferdig.
- **CI** (`.github/workflows/ci.yml`): bygg, format, lint, tester, Docker og gitleaks på hver PR. Deploy kun fra `main`.

Blokkerer en hook noe, er det med vilje. Ikke prøv å gå rundt den. Fiks årsaken eller spør brukeren.
