---
name: kundemeldinger
description: Tekster for SMS (via Sveve) og push-varsler til kunder i Vasko-stemmen, uten sensitive data. Bruk når du skriver eller endrer en melding som sendes til kunden, eller kode som sender SMS eller push.
---

# Kundemeldinger

## Stemmen
Rolig, varm, kort og norsk, som en god concierge. Du-form og én tanke per melding. Høyst ett utropstegn, og helst ingen. Ingen emoji, VERSALER eller markedsføring i servicemeldinger.

## Absolutte regler
- **Aldri** dørkode, gateadresse, fraværsvindu, betalingsdetaljer eller andre sensitive data i SMS eller push. Meldingen henviser til appen.
- Fornavn er lov i SMS, men ikke i push (push vises på låst skjerm).
- Push går via APNs og FCM (USA). Payloaden har bare generisk tekst og ordre-ID (ADR 0003).
- SMS: maks 160 tegn (én melding). Avsender er `Vasko`.

## Maler
| Hendelse | Tekst |
|---|---|
| Bestilling bekreftet | Takk, {fornavn}. Vi henter tøyet ditt {dag}. Sett posen utenfor døra, så tar vi oss av resten. |
| Påminnelse kvelden før | Vi kommer i morgen. Husk å sette posen utenfor døra. |
| Hentet | Tøyet ditt er hentet og på vei til vask. |
| Levert | Klærne dine er levert i Vasko-boksen. Tid til det som betyr noe. |
| Forsinkelse | Vi er dessverre litt forsinket i dag. Ny tid finner du i appen. Beklager. |
| Betaling feilet | Betalingen gikk ikke gjennom. Du kan fullføre den i Vasko-appen. |
| Innloggingskode | Koden din er {kode}. Den gjelder i 10 minutter. |

## Sende SMS (Sveve)
- Via `ISmsSender`, med implementasjonen `SveveSmsSender` (egen `HttpClient` mot Sveves REST-API, se ADR 0002). Brukernavn og passord kommer fra `Sveve__Brukernavn` og `Sveve__Passord`.
- Logg bare ordre-ID, malnavn og status fra Sveve. **Aldri** telefonnummer eller meldingstekst.
- Rate limit per kunde. Ingen SMS mellom kl. 21 og 08, med unntak av innloggingskoder.
- Malene ligger samlet i koden (én `MessageTemplates`-klasse), slik at vasko-reviewer kan sjekke dem.

## Sjekkliste før du sender
1. Inneholder meldingen noe fra «Aldri»-listen? Fjern det.
2. Er den under 160 tegn?
3. Ville en hotellconcierge sagt det slik?
