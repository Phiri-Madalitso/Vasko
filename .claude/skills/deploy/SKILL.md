---
name: deploy
description: Docker-bygg, GitHub Actions og utrulling til Scaleway Serverless Containers, inkludert migreringer og tilbakerulling. Bruk når du endrer Dockerfile, .github/workflows, miljøvariabler eller hemmeligheter i produksjon, eller når noe må deployes eller rulles tilbake.
---

# Deploy

## Oversikt
```
PR → ci.yml (bygg, tester, lint, gitleaks) → merge til main
   → deploy.yml: docker build → push rg.fr-par.scw.cloud/<namespace>/vasko-server:<git-sha>
   → kjør EF-migreringer (bundle) → oppdater container til ny tag → helsesjekk /health
```
- Deploy skjer **kun** fra `main`, via GitHub Actions. Aldri fra en utviklermaskin (`scw` er nektet i `.claude/settings.json`).
- Region `fr-par`. Bildet tagges med commit-SHA, aldri bare `latest`.

## Docker lokalt
```
docker build -t vasko-server server
docker run --rm -p 8080:8080 --env-file <din lokale env-fil> vasko-server
curl localhost:8080/health
```
Bildet kjører som ikke-root (`$APP_UID`) på port 8080.

## Hemmeligheter
- **Runtime** (database, Vipps, Sveve, krypteringsnøkkel): Scaleway Secret Manager, koblet til containeren som miljøvariabler. Aldri i workflow-filer.
- **GitHub Actions secrets** (i environment `production`): `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`, `SCW_DEFAULT_PROJECT_ID`, `SCW_DEFAULT_ORGANIZATION_ID`, `SCW_CONTAINER_ID`, `SCW_REGISTRY_NAMESPACE`, `MIGRATION_CONNECTION_STRING`.
- Environment `production` har påkrevd godkjenning.

## Migreringer
`dotnet ef migrations bundle` bygges i deploy-jobben og kjøres mot produksjonsdatabasen **før** containeren oppdateres. Migreringer må være bakoverkompatible med forrige versjon av koden (se `databaseendring`), siden gammel og ny container kan kjøre samtidig en kort stund. Workflowen hopper over steget så lenge det ikke finnes migreringer.

## Tilbakerulling
1. Finn forrige fungerende SHA (GitHub Actions-historikken eller Scaleway-konsollet → Container → Deployments).
2. Kjør workflowen **Deploy** manuelt (`workflow_dispatch`) med `image_tag=<forrige-sha>`. Den hopper over bygg og migrering og peker containeren til den gamle taggen.
3. Sjekk `/health` og en innlogging i admin.
4. Har en migrering ødelagt noe: skriv en ny, fremoverrettet migrering som retter feilen. Kjør `Down()` i produksjon bare etter avtale, og bare etter et snapshot.

## Før første deploy (manuelt, én gang)
- Opprett Container Registry-namespace, Serverless Container (port 8080, `min-scale 0`, helsesjekk `/health`), Managed PostgreSQL og Secret Manager-hemmeligheter i `fr-par`.
- Begrens databasetilgangen til containeren (Private Network) og GitHub-runneren for migreringer.
- Slå på branch protection på `main`: krever PR, grønn CI og ingen force-push.
