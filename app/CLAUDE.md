# app/: kundeappen

React Native + Expo (SDK 58) + TypeScript strict. Krever Node 22 (`nvm use` i roten).

@AGENTS.md

## Struktur
- `App.tsx`: inngangspunkt. Expo Router innføres når vi får mer enn én skjerm.
- `src/theme/tokens.ts`: **den eneste** kilden til farger, skrifter og avstand.
- `src/features/<funksjon>/`: skjermer, komponenter, API-kall og tester (`*.test.ts(x)` ved siden av koden).

## Regler
- **Ingen hemmeligheter i appen.** Alt i bundelen kan leses av hvem som helst. Bare `EXPO_PUBLIC_*`-verdier som er offentlige (for eksempel API-URL).
- **Appen snakker bare med vår backend.** Aldri direkte med Vipps, Sveve eller andre tjenester.
- **Dørkode og adresse:** hentes bare når de skal vises, lagres aldri i `AsyncStorage` eller logger, og maskeres som standard (vis med et trykk). Sesjonstoken lagres i `expo-secure-store`.
- **All validering skjer også på serveren.** Klientvalidering er bare for brukeropplevelsen.
- **UI:** følg skillen `vasko-design`. Ingen hardkodede hex-verdier, ingen nye skrifter og én primærhandling per skjerm.
- **Tekst:** norsk bokmål i Vasko-stemmen. Feilmeldinger er rolige og forteller hva kunden kan gjøre («Noe gikk galt. Prøv igjen om litt.»).
- **Statistikk:** bare Plausible, og bare hendelser uten persondata.
- **Avhengigheter:** `npx expo install <pakke>`. Nye pakker som sender data ut av appen krever en ADR (ADR 0003).

## Kommandoer
```
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest
npm run verify      # alle tre (det CI kjører)
npx expo start
```
