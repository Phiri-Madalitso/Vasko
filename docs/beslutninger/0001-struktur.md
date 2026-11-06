# 0001 Struktur: modulær monolitt organisert etter funksjon

**Status:** Vedtatt (2026-11-07)

## Kontekst
To grunnleggere skal utvikle en pilot for rundt 50 kunder. Vi trenger rask utvikling, enkel drift og tydelige grenser i koden, slik at Claude Code og mennesker finner frem.

## Beslutning
- Ett repo med `app/` (Expo) og `server/` (ASP.NET Core).
- Backend er **én applikasjon**: API og Razor (admin og sjåfør) i samme prosjekt, med én database og én container.
- Koden organiseres etter funksjon: `Features/Bestillinger`, `Henting`, `Kunder`, `Betaling` og `Ruter`. Hver mappe har sin egen controller, service og modeller.
- Tester ligger i et eget xUnit-prosjekt som speiler `Features/`-strukturen, slik at testavhengigheter ikke havner i produksjonsbygget.
- Tynne controllere. Logikken ligger i servicer.

## Konsekvenser
- ➕ Én deploy, én logg, ingen nettverkskall mellom tjenester og enkle transaksjoner.
- ➕ En funksjon kan senere skilles ut, fordi grensene allerede finnes.
- ➖ Disiplin kreves: funksjoner skal ikke gå direkte i hverandres tabeller. Dette sjekkes i review.
- ➖ Admin og API skalerer sammen. Det er uproblematisk i piloten.
