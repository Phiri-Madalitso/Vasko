# Sikkerhet

Vasko lagrer adresser, dørkoder, tidsvinduer for når folk ikke er hjemme, og betalingsinformasjon. En lekkasje kan gi innbrudd. Disse reglene går foran alt annet, også fremdrift.

> Regler i MD-filer er råd. Det som *aldri* får skje, stoppes automatisk av hooks (`.claude/hooks/`) og CI (`.github/workflows/ci.yml`).

## 1. Dørkoder og adresser
- **Kryptert i databasen.** Dørkode, gateadresse og leveringsinstruks krypteres per felt (AES-GCM via en EF Core value converter). Nøkkelen kommer fra Secret Manager og ligger aldri i koden.
- **Ukryptert ved behov:** postnummer og område, som Ruter trenger for planlegging.
- **Hvem ser hva:**

  | | Dørkode | Full adresse |
  |---|---|---|
  | Kunden selv | ✅ egen | ✅ egen |
  | Sjåfør | ✅ kun for stopp på **sin aktive rute i dag** | ✅ samme |
  | Vaskeripartner | ❌ | ❌ (ser bare ordre-ID og plagg) |
  | Admin | ❌ (bare «satt / ikke satt») | ✅ |

- **Logges aldri.** Ikke i applogger, ikke i exception-meldinger og ikke i audit-tekst. Bruk `[LogMasked]` eller utelat feltet. Audit logger *at* sjåfør X så dørkoden for ordre Y, men aldri selve koden.

## 2. SMS og push
- **Aldri** dørkode, full adresse eller tidsvindu for fravær i SMS eller push. Meldingene henviser til appen: «Klærne dine er levert. Se detaljer i Vasko-appen.»
- Push går via APNs og FCM (USA, se ADR 0003). Innholdet skal derfor være uten persondata, bare status.

## 3. Hemmeligheter
- Aldri i kode, `appsettings*.json` eller Git. Lokalt: `.env` (gitignorert). Produksjon: **Scaleway Secret Manager**, injisert som miljøvariabler.
- `.env.example` har bare variabelnavn.
- Håndheves av PreToolUse-hooken `beskytt-hemmeligheter.mjs` og gitleaks i CI. Hvis en hemmelighet lekker: roter den med en gang. Å slette commiten er ikke nok.

## 4. Input og API
- **All input valideres på serveren.** Klienten er aldri til å stole på, heller ikke vår egen app.
- Ressurs-eierskap sjekkes i servicen: en kunde kan bare hente *sine* ordre. Unngå ID-er som kan gjettes i URL-er der det er mulig (bruk GUID).
- Rate limiting på innlogging, SMS-utsending og betaling.
- Feilsvar avslører aldri stacktrace eller intern struktur (ProblemDetails uten detaljer i produksjon).

## 5. Roller og tilgang (least privilege)
Rollene er `Kunde`, `Sjafor`, `Vaskeripartner` og `Admin`. Hver controller og action har en **navngitt policy** (`[Authorize(Policy = Policies.SjaforPaAktivRute)]`). Det finnes ingen `[AllowAnonymous]` uten en kommentar som forklarer hvorfor. Admin er ikke «superbruker» for sensitive felt (se tabellen over).

## 6. Vipps og betaling
- Vipps Login og ePayment kalles **kun fra backend**. Appen får aldri Vipps-nøkler.
- Vi lagrer **aldri** kortdata. Vi lagrer bare Vipps-referanse, beløp og status.
- Callbacks og webhooks verifiseres (signatur eller auth-token) og avstemmes alltid mot `GET payment` hos Vipps før status endres.
- Alle betalingskall er idempotente (`Idempotency-Key`). Se skillen `vipps-betaling`.

## 7. Admin og sjåfør (Razor)
- Krever innlogging, og har et cookie-oppsett med `HttpOnly`, `Secure` og `SameSite=Lax`.
- CSRF-beskyttelse: `AutoValidateAntiforgeryToken` globalt på MVC-controllerne og `<form asp-...>` i alle skjemaer.
- **Data Protection-nøkler lagres i Postgres** (`PersistKeysToDbContext`). Ellers brytes innlogging og antiforgery når Scaleway starter eller skalerer containere.
- Sikkerhetsheadere: CSP, `X-Content-Type-Options` og `Referrer-Policy`, med HSTS i produksjon.

## 8. GDPR
- **Dataminimering:** vi samler bare det som trengs for henting, vask, levering og betaling.
- **Sletting:** dørkoden slettes når kunden ber om det eller ved avslutning. Kontoen slettes eller anonymiseres på forespørsel, og etter 24 måneder uten aktivitet. Regnskapsdata beholdes i 5 år etter bokføringsloven, uten dørkode og adresse.
- **Innsyn og eksport** av egne data skal være mulig fra appen.
- **Kundedata forlater ikke EU/EØS.** Nye underleverandører som ser persondata krever en ADR først (ADR 0003).
- Produksjonsdata kopieres aldri til en utviklermaskin. Testdata er syntetisk.
