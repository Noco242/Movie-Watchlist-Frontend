# Movie Watchlist Frontend

Angular-Frontend im Netflix-Design mit deutscher UI, Auth-Demo (Login/Register/Logout), geschuetzter Watchlist und TMDB-Integration (Suche + Trending).

## Features (MVP)

- Login, Registrierung und Logout (lokal per `localStorage`, backend-ready vorbereitet)
- Route-Schutz fuer `Meine Watchlist`
- TMDB Suche (`/search/multi`) und Trending (`/trending/all/week`)
- Watchlist-Felder:
  - `titel`
  - `typ` (`movie` oder `tv`)
  - `gesehen`
  - `bewertung` (0 bis 10)
  - zusaetzlich: `notiz`, `jahr`, `tmdbId`, `posterPath`, `hinzugefuegtAm`

## Lokaler Start

1. Abhaengigkeiten installieren
2. TMDB API-Key eintragen
3. App starten

```bash
npm install
npm run start
```

Die App laeuft dann auf `http://localhost:4200`.

## TMDB API-Key setzen

Datei: `src/environments/environment.development.ts`

```ts
apiKey: 'HIER_TMDB_API_KEY_EINTRAGEN'
```

TMDB-Key erstellen: https://www.themoviedb.org/settings/api

## Build und Tests

```bash
npm run build
npm run test
```

## Geplante Python-Backend-Anbindung

Aktuell ist die Persistenz lokal. Fuer das spaetere Python-Backend ist bereits `backendBaseUrl` vorgesehen:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Empfohlene naechste Schritte Backend:

1. FastAPI oder Django REST API mit JWT-Endpunkten (`/auth/register`, `/auth/login`, `/auth/refresh`)
2. Watchlist-Endpunkte (`GET/POST/PATCH/DELETE /watchlist`)
3. Frontend-Services von `localStorage` auf HTTP umstellen (gleiche Domainenmodelle bleiben bestehen)
