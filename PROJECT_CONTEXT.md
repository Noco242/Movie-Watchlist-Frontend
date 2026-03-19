# Projekt-Briefing: Movie Watchlist Frontend

## 1) Ziel und Scope
Dieses Projekt ist ein Angular-Frontend fuer eine Movie-/Serien-Watchlist im Netflix-inspirierten Design.

Aktueller Scope (MVP):
- Deutsche UI
- Auth-Demo mit Login, Register, Logout (lokal via localStorage)
- Geschuetzte Route fuer `Meine Watchlist`
- TMDB-Integration fuer Suche und Trending
- Watchlist-Verwaltung pro eingeloggtem User

Geplanter naechster Scope:
- Python-Backend (empfohlen: FastAPI) anbinden
- Auth von lokalem Mock auf JWT + Refresh umstellen
- Watchlist serverseitig persistieren

## 2) Tech-Stack
- Angular 21 (Standalone Components, Router, Signals)
- TypeScript (strict)
- HttpClient fuer TMDB
- localStorage als temporaere Persistenz

## 3) Architekturueberblick
Routen:
- `/entdecken` -> Home/Discover (Suche + Trending)
- `/login` -> Login
- `/register` -> Registrierung
- `/watchlist` -> Geschuetzt via `authGuard`

Hauptlogik:
- `AuthService`: User-Session, Register, Login, Logout
- `WatchlistService`: Watchlist-Eintraege je User verwalten
- `TmdbService`: TMDB-Suche, Trending, Bild-URLs

Sicherheits-/Migrationsprinzip:
- Services sind so organisiert, dass spaeter HTTP-Calls zum Python-Backend eingebaut werden koennen, ohne die gesamte UI neu zu schreiben.

## 4) Wichtige Dateien
- App-Shell / Navigation:
  - `src/app/app.ts`
  - `src/app/app.html`
  - `src/app/app.css`
- Routing / Config:
  - `src/app/app.routes.ts`
  - `src/app/app.config.ts`
- Guard:
  - `src/app/core/guards/auth.guard.ts`
- Models:
  - `src/app/core/models/user.model.ts`
  - `src/app/core/models/tmdb.model.ts`
  - `src/app/core/models/watchlist-item.model.ts`
- Services:
  - `src/app/core/services/auth.service.ts`
  - `src/app/core/services/tmdb.service.ts`
  - `src/app/core/services/watchlist.service.ts`
- Feature-Seiten:
  - `src/app/features/home/home-page.component.ts`
  - `src/app/features/auth/login-page.component.ts`
  - `src/app/features/auth/register-page.component.ts`
  - `src/app/features/watchlist/watchlist-page.component.ts`
- Environments:
  - `src/environments/environment.ts`
  - `src/environments/environment.development.ts`

## 5) Datenmodell (Frontend)
User:
- `AppUser`: `id`, `name`, `email`
- `StoredUser`: `AppUser` + `password` (nur lokale Demo)

TMDB:
- `TmdbMedia`: `id`, `mediaType`, `title`, `overview`, `posterPath`, `backdropPath`, `releaseDate`, `voteAverage`, `genreIds`

Watchlist:
- `id`
- `ownerId`
- `tmdbId`
- `title`
- `type` (`movie` | `tv`)
- `gesehen` (boolean)
- `bewertung` (0..10)
- `notiz`
- `posterPath`
- `jahr`
- `hinzugefuegtAm`

## 6) Aktueller Auth-Stand
Der aktuelle Auth-Flow ist ein lokaler Platzhalter:
- Register speichert User lokal
- Login validiert gegen lokale User
- Session wird lokal gehalten
- Guard prueft, ob Session existiert

Wichtig:
- Das ist bewusst nur ein MVP-Demo-Flow.
- Fuer Produktion auf JWT + Refresh + serverseitige Userverwaltung umstellen.

## 7) TMDB-Stand
- Suche: `/search/multi`
- Trending: `/trending/all/week`
- Sprache: `de-DE`
- Bildbasis: `https://image.tmdb.org/t/p/w500`

## 8) Konfiguration
- `backendBaseUrl` ist vorbereitet, aktuell aber noch nicht aktiv fuer Auth/Watchlist-HTTP.
- Development-Umgebung nutzt `environment.development.ts` (via fileReplacement in `angular.json`).

## 9) Offene To-dos (Prioritaet)
P1 (Backend-Integration):
1. Python-Backend aufsetzen (FastAPI empfohlen)
2. JWT-Endpunkte bereitstellen: `/auth/register`, `/auth/login`, `/auth/refresh`, optional `/auth/logout`
3. Watchlist-Endpunkte bereitstellen: `GET/POST/PATCH/DELETE /watchlist`
4. `AuthService` und `WatchlistService` von localStorage auf HTTP umstellen

P2 (Produktionsreife):
1. Passwortregeln, Fehlermeldungen, Formularvalidierung erweitern
2. Besseres Session-Handling (Token expiry, silent refresh)
3. E2E-Tests hinzufuegen

P3 (UX):
1. Detailseite pro Titel
2. Filter/Sortierung in Watchlist
3. Optional: Kategorien/Rows wie Netflix-Homepage

## 10) Sicherheitshinweis
- Keine echten API-Keys in Git committen.
- TMDB-Key nur lokal oder ueber Secrets/CI-Variablen setzen.
- Wenn ein Key versehentlich geteilt wurde: sofort rotieren.

## 11) Start-Prompt fuer neuen Chat (copy/paste)
Nutze diesen Prompt in einem neuen Projekt/Chat:

"Lies zuerst `PROJECT_CONTEXT.md` und arbeite exakt auf diesem Stand weiter.

Ziel jetzt:
- Python-Backend (FastAPI) fuer Auth + Watchlist bereitstellen
- Frontend-Services auf echte HTTP-Endpunkte umstellen
- JWT + Refresh Flow implementieren

Randbedingungen:
- UI bleibt deutsch
- Bestehende Angular-Struktur beibehalten
- Moeglichst kleine, saubere Commits/Schritte

Bitte zuerst einen kurzen Umsetzungsplan liefern und dann direkt mit der Implementierung beginnen."

