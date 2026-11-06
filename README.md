# Vasko

**Vask · Rens · Levert**

Vasko er en eksklusiv vaske- og rensetjeneste: «Oda for klesvask». Kunden bestiller i appen og setter skittentøyet utenfor døra. Vi henter, vasker og stryker, og leverer klærne strøkne og pent brettet i en Vasko-boks.

| Mappe | Innhold |
|---|---|
| `app/` | Kundeapp: React Native + Expo + TypeScript |
| `server/` | Backend: ASP.NET Core .NET 10 (API + admin/sjåfør i Razor) |
| `docs/` | Visjon, arkitektur, sikkerhet, stil og beslutninger (ADR) |
| `.claude/` | Regler, hooks, agenter og skills for Claude Code |

## Kom i gang

**Krav:** .NET SDK 10, Node 22 (`nvm install && nvm use`), Docker, gitleaks (`brew install gitleaks`).

```bash
# Miljøvariabler
cp .env.example .env          # fyll inn lokale verdier, aldri commit .env

# Backend
cd server
dotnet test
dotnet run --project src/Vasko.Server   # http://localhost:5197/health

# App
cd app
npm ci
npm run verify
npx expo start
```

### Anbefalt: gitleaks før hver commit
```bash
printf '#!/bin/sh\ngitleaks git --staged --redact --exit-code 1\n' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Slik jobber vi
- All utvikling skjer via pull request til `main`. CI må være grønn, og deploy til Scaleway skjer automatisk fra `main`.
- Les `CLAUDE.md` og `docs/sikkerhet.md` før du begynner.
