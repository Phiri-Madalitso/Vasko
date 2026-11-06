# 0003 Kun europeiske leverandører for kundedata

**Status:** Vedtatt (2026-11-07)

## Kontekst
Vi behandler adresser, dørkoder, fraværsvinduer og betalinger. Kundene må kunne stole på at dataene ikke havner hos leverandører utenfor EU/EØS. Det reduserer også GDPR-risikoen ved overføring til tredjeland.

## Beslutning
1. Kundedata lagres og behandles **kun** av leverandører i EU/EØS.
2. **Ingen ny underleverandør som ser persondata uten en ADR først.** ADR-en skal beskrive hvilke data leverandøren ser, hvor dataene lagres, og at det finnes en databehandleravtale.
3. Godkjente underleverandører:

| Leverandør | Land | Data de ser | Formål |
|---|---|---|---|
| Scaleway | Frankrike | Alt (hosting og database), kryptert | Drift |
| Vipps MobilePay | Norge | Navn, telefon, e-post, betaling | Innlogging og betaling |
| Sveve | Norge | Telefonnummer og meldingstekst (uten sensitive data) | SMS |
| Plausible | EU (Estland/Tyskland) | Ingen persondata (uten informasjonskapsler) | Statistikk |

4. **Unntak: push-varsler (Apple APNs, Google FCM, USA).** Push til iOS og Android er bare mulig via disse. Vilkår for unntaket:
   - Payload inneholder **aldri** persondata, bare generisk status («Klærne dine er levert»).
   - Backend sender direkte til APNs og FCM, ikke via Expo Push Service (en ekstra amerikansk mellomledd).
   - Push-tokenet lagres hos oss (Scaleway) og deles ikke med andre.
5. **Ikke kundedata:** GitHub (kildekode), Expo/EAS (bygg av appen) og App Store / Google Play (distribusjon). Disse får aldri produksjonsdata, heller ikke i logger eller testdata.

## Konsekvenser
- ➕ Enklere GDPR-dokumentasjon og et ærlig løfte til kundene.
- ➖ Færre ferdige SaaS-verktøy. For eksempel kan vi ikke bruke Sentry US, Twilio eller Firebase Analytics uten en ny ADR.
- Feilsporing og logging må velges med dette i tankene (Scaleway Cockpit eller en EU-hostet løsning). Det krever en egen ADR.
