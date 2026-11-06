---
name: vipps-betaling
description: Integrasjon med Vipps Login (innlogging) og Vipps MobilePay ePayment (reservering, capture, refusjon, kansellering, webhooks). Bruk når du jobber i Features/Betaling eller med innlogging i Features/Kunder, når kode kaller Vipps, eller ved feilsøking av betalingsstatus.
---

# Vipps: Login og ePayment

**Verifiser endepunkter og headere mot https://developer.vippsmobilepay.com før du skriver kode.** Ikke stol på hukommelsen.

## Grunnregler
- Alle Vipps-kall gjøres **fra backend**, via `IVippsClient` i `Features/Betaling/`. Appen får aldri nøkler.
- Lokalt brukes `apitest.vipps.no`, i produksjon `api.vipps.no`. Valget styres av `Vipps__BaseUrl`.
- Nøklene kommer fra miljøvariabler (`Vipps__ClientId`, `Vipps__ClientSecret`, `Vipps__SubscriptionKey`, `Vipps__MerchantSerialNumber`).
- Vi lagrer **aldri** kortdata. Vi lagrer bare `reference`, beløp, status og tidsstempler.
- Beløp er i øre (`{ "currency": "NOK", "value": 49900 }`). Bruk `long`, aldri `decimal` eller `double` for øre.

## Innlogging (Vipps Login, OIDC)
1. Appen åpner `GET /api/auth/vipps/start` hos oss. Backend lager `state` og `nonce` (lagret server-side) og redirecter til Vipps.
2. Vipps sender kunden tilbake til **backend** (`/api/auth/vipps/callback`). Backend sjekker `state`, bytter `code` mot token og validerer `id_token` (`iss`, `aud`, `nonce`, `exp`).
3. Backend finner eller oppretter kunden (`sub` er nøkkelen) og gir appen en egen kortlevd sesjon via deep link `vasko://`. Vipps-tokens forlater aldri backend.
4. Be bare om scopes vi trenger (`openid`, `name`, `phoneNumber`, eventuelt `address`).

## Betalingsflyt (ePayment)
```
Bestilling → CREATE (reserve) → kunden godkjenner i Vipps → AUTHORIZED
   → klær levert → CAPTURE (hele eller deler av beløpet)
   → ved avvik → REFUND (av captured beløp)
   → avbestilt før levering → CANCEL (frigjør reservasjonen)
```
- **Reserver ved bestilling, capture først når klærne er levert.**
- Uten levering innen 7 dager: `cancel`, og varsle admin.

## Idempotens
- **Hver** `create`, `capture`, `refund` og `cancel` sender en `Idempotency-Key`.
- Nøkkelen er deterministisk per handling, for eksempel `"{orderId}-capture-1"`. Retry av samme handling bruker **samme** nøkkel, slik at vi aldri trekker kunden dobbelt.
- `reference` = vår ordre-ID (8–64 tegn, `[a-zA-Z0-9-]`).

## Webhooks og callbacks
- Registrer webhooks for `epayments.payment.*` via Webhooks-API-et. Lagre webhook-hemmeligheten i Secret Manager.
- **Verifiser signaturen** (HMAC-SHA256 over headere og innholdshash) på hver forespørsel. Avvis med 401 ved feil.
- Stol aldri på innholdet alene. Hent alltid `GET /epayment/v1/payments/{reference}` før status endres i databasen.
- Håndter duplikater og feil rekkefølge: oppdater bare status fremover i tilstandsmaskinen, og logg event-ID.

## Feilhåndtering
| Situasjon | Håndtering |
|---|---|
| Timeout eller 5xx fra Vipps | Retry med eksponentiell backoff, maks 3, samme `Idempotency-Key` |
| 4xx | Ingen retry. Logg `reference` og feilkode (aldri persondata), vis kunden en rolig norsk melding |
| Ukjent status | Avstem med `GET payment`. Bakgrunnsjobb avstemmer hengende betalinger hvert 15. minutt |
| Kunden avbryter i Vipps | Status `ABORTED` eller `EXPIRED`. Ordren forblir ubetalt, og kunden kan prøve igjen |

## Tester
`IVippsClient` mockes i servicetester. Tilstandsmaskinen (lovlige overganger) testes uttømmende. Integrasjonstester mot Vipps test-miljø kjøres manuelt, ikke i CI.
