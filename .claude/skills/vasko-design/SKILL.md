---
name: vasko-design
description: Design-tokens, farger, typografi, avstand og komponentprinsipper for Vasko. Bruk når du lager eller endrer skjermer og komponenter i app/, Razor Views eller CSS i server/, eller når du velger farger, skrifter eller layout.
---

# Vasko-design

Følelsen er hotellservice hjemme: rolig, luftig og eksklusiv. Når du er i tvil, ta bort heller enn å legge til.

## Tokens: én kilde, to formater
| Token | App (`app/src/theme/tokens.ts`) | Razor (`wwwroot/css/site.css`) | Verdi |
|---|---|---|---|
| Navy | `colors.navy` | `--vasko-navy` | `#1F2E4A` |
| Cognac | `colors.cognac` | `--vasko-cognac` | `#8B5E3C` |
| Krem | `colors.cream` | `--vasko-krem` | `#F6F1E8` |
| Krem lys | `colors.creamLight` | `--vasko-krem-lys` | `#FFFDF8` |
| Dempet tekst | `colors.textMuted` | `--vasko-tekst-dempet` | `#5C6577` |
| Linje | `colors.border` | `--vasko-linje` | `#E4DCCD` |
| Feil | `colors.error` | `--vasko-feil` | `#9B2C2C` |

**Regel:** ingen hex-verdier utenfor disse to filene. Endrer du ett token, endrer du begge filene i samme commit.

## Bruk av farger
- Bakgrunnen er `creamLight`, kort og seksjoner er `cream`, tekst og primærknapper er `navy`.
- **Cognac er aksent, ca. 3:1 navy mot cognac:** «o» i logoen, en tynn linje, et aktivt ikon eller en liten detalj. Aldri store flater, aldri primærknapp og aldri brødtekst.
- Feilfargen brukes bare på feilmeldinger, og alltid sammen med tekst (aldri bare farge).
- Kontrast: tekst skal oppfylle WCAG AA (4.5:1). Navy på krem gjør det.

## Typografi
| Rolle | Skrift | Størrelse |
|---|---|---|
| Logo | Cormorant Garamond 600 | 28–48 |
| H1 | Cormorant Garamond 600 | 32 |
| H2 | Cormorant Garamond 600 | 24 |
| Brødtekst | Inter 400 | 16, linjehøyde 1.5 |
| Etikett og knapp | Inter 500 | 15 |
| Hjelpetekst | Inter 400, `textMuted` | 14 |

App: last inn fontene med `@expo-google-fonts/cormorant-garamond` og `@expo-google-fonts/inter` (`npx expo install`). Fontnavnene står i `fonts.*`.

## Avstand
Skalaen er `xs 4 · sm 8 · md 16 · lg 24 · xl 40 · xxl 64`, og bare den skal brukes. Skjermkanten er `lg`, avstanden mellom seksjoner er `xl` og innholdet i et kort har `md`.

## Komponentprinsipper
- **Én primærhandling per skjerm.** Den er navy og fyller bredden nederst. Sekundærhandlinger er tekstlenker.
- **Knapper:** minst 48 pt høye, `radius.md`, tekst i Inter 500 og ingen skygge.
- **Kort:** `cream`-flate, 1px `border`, ingen eller svært svak skygge.
- **Ikoner:** tynne linjeikoner i én stil. Ingen emoji i UI-et.
- **Tomtilstander og lasting:** en rolig setning og en skeleton. Aldri en spinner alene i mer enn ett sekund.
- **Bevegelse:** korte, myke overganger (200–250 ms ease-out). Ingen sprett.
- **Tilgjengelighet:** `accessibilityLabel` på alt som er trykkbart, støtte for dynamisk skriftstørrelse og trykkflater på minst 44×44.

## Logo
«Vask» i navy og «o» i cognac, Cormorant Garamond 600. Se `app/App.tsx` og `server/src/Vasko.Server/Views/Shared/_Layout.cshtml`.
