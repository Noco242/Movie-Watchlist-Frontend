# 🎬 Movie Watchlist Frontend - Backend Briefing

## Übersicht

Das FastAPI-Backend für die Movie Watchlist Anwendung ist fertig und läuft unter:
**`http://localhost:8000`**

Dieses Dokument erklärt die API, wie man sie nutzt und wie die Integration funktioniert.

---

## 🚀 Backend starten

```bash
cd /home/noahb/Dokumente/Movie-Watchlist/Movie-Watchlist-Backend
python api.py
```

Das Backend läuft dann auf Port **8000** und ist erreichbar unter:
- REST API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs` (interaktiv testen!)
- ReDoc: `http://localhost:8000/redoc`

---

## 🔐 Authentifizierung

### JWT Token System

Das Backend nutzt **JWT (JSON Web Tokens)** für die Authentifizierung:
- **Access Token**: Gültig für 15 Minuten (wird für API-Requests benötigt)
- **Refresh Token**: Gültig für 7 Tage (um neue Access Tokens zu bekommen)

### Token im Frontend speichern

Die Tokens sollten im **LocalStorage** gespeichert werden:

```typescript
// Nach erfolgreichem Login
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);
```

### Token bei jedem Request senden

Alle geschützten Endpoints erfordern den Token im **Authorization Header**:

```typescript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};

fetch('http://localhost:8000/watchlist', {
  headers: headers
});
```

---

## 📡 API Endpoints

### 1. Authentication (Ungeschützt)

#### Register - Neuen Benutzer erstellen
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Login - Anmelden
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Refresh Token - Neuen Access Token bekommen
```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Logout
```
POST /auth/logout

Response (200):
{
  "message": "Erfolgreich abgemeldet"
}
```

---

### 2. Watchlist (Geschützt - Token erforderlich!)

#### Get Watchlist - Alle Einträge abrufen
```
GET /watchlist
Authorization: Bearer <access_token>

Response (200):
[
  {
    "id": 1,
    "owner_id": 1,
    "tmdb_id": 550,
    "title": "Fight Club",
    "type": "movie",
    "gesehen": false,
    "bewertung": null,
    "notiz": null,
    "poster_path": "/path/to/poster.jpg",
    "jahr": 1999,
    "hinzugefuegtAm": "2024-03-19T10:30:00",
    "updated_at": "2024-03-19T10:30:00"
  }
]
```

#### Add to Watchlist - Neuen Eintrag hinzufügen
```
POST /watchlist
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "tmdb_id": 550,
  "title": "Fight Club",
  "type": "movie",
  "poster_path": "/path/to/poster.jpg",
  "jahr": 1999
}

Response (200):
{
  "id": 1,
  "owner_id": 1,
  "tmdb_id": 550,
  "title": "Fight Club",
  "type": "movie",
  "gesehen": false,
  "bewertung": null,
  "notiz": null,
  "poster_path": "/path/to/poster.jpg",
  "jahr": 1999,
  "hinzugefuegtAm": "2024-03-19T10:30:00",
  "updated_at": "2024-03-19T10:30:00"
}
```

#### Update Watchlist Item - Eintrag aktualisieren
```
PATCH /watchlist/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "gesehen": true,
  "bewertung": 9.5,
  "notiz": "Absolut fantastisch!"
}

Response (200):
{
  "id": 1,
  "owner_id": 1,
  "tmdb_id": 550,
  "title": "Fight Club",
  "type": "movie",
  "gesehen": true,
  "bewertung": 9.5,
  "notiz": "Absolut fantastisch!",
  "poster_path": "/path/to/poster.jpg",
  "jahr": 1999,
  "hinzugefuegtAm": "2024-03-19T10:30:00",
  "updated_at": "2024-03-19T10:30:00"
}
```

#### Delete Watchlist Item - Eintrag löschen
```
DELETE /watchlist/{id}
Authorization: Bearer <access_token>

Response (200):
{
  "message": "Eintrag erfolgreich gelöscht"
}
```

---

### 3. User (Geschützt - Token erforderlich!)

#### Get Profile - Aktuelles User-Profil abrufen
```
GET /user/profile
Authorization: Bearer <access_token>

Response (200):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-03-19T10:00:00"
}
```

---

### 4. Health Check (Ungeschützt)

#### Health Check - Prüfen ob Backend läuft
```
GET /health

Response (200):
{
  "status": "ok"
}
```

---

## 🔧 Angular Service Integration

### AuthService (aktualisieren)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) { }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      name,
      email,
      password
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  refresh(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/refresh`, {
      refresh_token: refreshToken
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
```

### HTTP Interceptor (Token automatisch hinzufügen)

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

Registriere den Interceptor in `app.config.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... andere Provider
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
```

### WatchlistService (neu)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface WatchlistItem {
  id?: number;
  tmdb_id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path?: string;
  jahr?: number;
  gesehen?: boolean;
  bewertung?: number;
  notiz?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private apiUrl = 'http://localhost:8000/watchlist';

  constructor(private http: HttpClient) { }

  getWatchlist(): Observable<WatchlistItem[]> {
    return this.http.get<WatchlistItem[]>(this.apiUrl);
  }

  addToWatchlist(item: WatchlistItem): Observable<WatchlistItem> {
    return this.http.post<WatchlistItem>(this.apiUrl, item);
  }

  updateWatchlistItem(id: number, updates: Partial<WatchlistItem>): Observable<WatchlistItem> {
    return this.http.patch<WatchlistItem>(`${this.apiUrl}/${id}`, updates);
  }

  deleteFromWatchlist(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

### UserService (neu)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/user';

  constructor(private http: HttpClient) { }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
```

---

## 🌐 CORS Konfiguration

Das Backend erlaubt Requests nur von der Frontend-URL in der `.env`:
```
FRONTEND_URL=http://localhost:4200
```

Wenn die Frontend auf einer anderen URL läuft (z.B. `http://localhost:4200`), muss das Backend aktualisiert werden!

---

## 🛡️ Error Handling

Mögliche Fehler vom Backend:

```typescript
// 401 Unauthorized - Token ungültig oder abgelaufen
// -> Refresh Token verwenden oder neu anmelden

// 403 Forbidden - Benutzer hat keine Berechtigung
// -> Benutzer darf nicht auf diese Ressource zugreifen

// 404 Not Found - Ressource nicht gefunden
// -> z.B. Watchlist-Item existiert nicht

// 409 Conflict - Ressource existiert bereits
// -> z.B. Email ist bereits registriert

// 422 Unprocessable Entity - Validierungsfehler
// -> Überprüfe die eingaben (z.B. Email-Format)
```

Beispiel Error Handler:

```typescript
this.authService.login(email, password).subscribe({
  next: (response) => {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
  },
  error: (error) => {
    if (error.status === 401) {
      console.error('Email oder Passwort falsch');
    } else if (error.status === 422) {
      console.error('Validierungsfehler:', error.error.detail);
    }
  }
});
```

---

## 📝 Verwendungsbeispiel

### Login und Watchlist laden

```typescript
export class WatchlistComponent implements OnInit {
  watchlist: WatchlistItem[] = [];

  constructor(
    private authService: AuthService,
    private watchlistService: WatchlistService
  ) { }

  ngOnInit(): void {
    // Prüfe ob Benutzer angemeldet ist
    if (this.authService.isLoggedIn()) {
      this.loadWatchlist();
    }
  }

  login(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.loadWatchlist();
      },
      error: (error) => console.error('Login fehlgeschlagen', error)
    });
  }

  loadWatchlist(): void {
    this.watchlistService.getWatchlist().subscribe({
      next: (items) => {
        this.watchlist = items;
      },
      error: (error) => console.error('Watchlist laden fehlgeschlagen', error)
    });
  }

  addToWatchlist(item: WatchlistItem): void {
    this.watchlistService.addToWatchlist(item).subscribe({
      next: (newItem) => {
        this.watchlist.push(newItem);
      },
      error: (error) => console.error('Hinzufügen fehlgeschlagen', error)
    });
  }

  markAsWatched(id: number): void {
    this.watchlistService.updateWatchlistItem(id, { gesehen: true }).subscribe({
      next: (updated) => {
        const index = this.watchlist.findIndex(item => item.id === id);
        if (index !== -1) {
          this.watchlist[index] = updated;
        }
      },
      error: (error) => console.error('Update fehlgeschlagen', error)
    });
  }

  deleteFromWatchlist(id: number): void {
    this.watchlistService.deleteFromWatchlist(id).subscribe({
      next: () => {
        this.watchlist = this.watchlist.filter(item => item.id !== id);
      },
      error: (error) => console.error('Löschen fehlgeschlagen', error)
    });
  }
}
```

---

## 🧪 Testen mit Swagger

Das Backend hat eine interaktive Swagger UI. Öffne:
```
http://localhost:8000/docs
```

Dort kannst du:
1. Alle Endpoints sehen
2. Requests direkt testen
3. Request/Response Formate sehen
4. Authentifizierung testen

---

## 🐛 Häufige Probleme

### "CORS error"
**Lösung**: Stellen Sie sicher, dass die Frontend-URL in `.env` korrekt ist (z.B. `http://localhost:4200`)

### "401 Unauthorized"
**Lösung**: Token ist nicht vorhanden oder abgelaufen. Nutze Refresh Token oder melde dich neu an.

### "Cannot POST /watchlist"
**Lösung**: Das Backend läuft nicht. Starte es mit `python api.py`

### "Network Error"
**Lösung**: Backend URL in den Services überprüfen (sollte `http://localhost:8000` sein)

---

## 📞 Nächste Schritte für Frontend

1. **Services aktualisieren** - AuthService, WatchlistService, UserService
2. **HTTP Interceptor** - Token automatisch hinzufügen
3. **Login Component** - Mit Backend verbinden
4. **Watchlist Component** - Mit Backend verbinden
5. **Error Handling** - Für alle API Calls
6. **Token Refresh** - Automatisch neue Tokens holen
7. **Logout** - Cleanup und LocalStorage löschen

---

## 🎯 Checkliste für Integration

- [ ] Backend läuft unter `http://localhost:8000`
- [ ] AuthService mit Backend verbunden
- [ ] HTTP Interceptor für Tokens registriert
- [ ] WatchlistService implementiert
- [ ] UserService implementiert
- [ ] CORS funktioniert (keine CORS Errors)
- [ ] Login/Register funktioniert
- [ ] Watchlist laden/speichern funktioniert
- [ ] Logout funktioniert
- [ ] Error Handling implementiert
- [ ] Token Refresh funktioniert

---

**Viel Erfolg bei der Integration! 🚀**

Bei Fragen oder Problemen: Backend unter `http://localhost:8000/docs` konsultieren!

